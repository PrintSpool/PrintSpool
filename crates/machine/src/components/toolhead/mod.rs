use eyre::{
    eyre,
    Result,
    // Context as _,
};
use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use validator::Validate;
use regex::Regex;
use teg_json_store::{ Record as _ };
use teg_material::{Material, MaterialConfigEnum};

use crate::{config::MachineConfig};

use super::ComponentInner;
use super::{
    HeaterEphemeral,
    AxisEphemeral,
};

mod toolhead_resolvers;

lazy_static! {
    static ref EXTRUDER_ADDRESS: Regex = Regex::new(r"^e\d+$").unwrap();
}

/// # Toolhead
#[derive(Serialize, Deserialize, JsonSchema, Validate, Default, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ToolheadConfig {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # GCode Address
    #[validate(regex(path = "EXTRUDER_ADDRESS", message = r#"
        Toolhead address must start with the letter 'e' followed by a number
        (eg. e1 or e2)
    "#))]
    pub address: String,

    /// # Heated Extruder
    #[serde(default)]
    pub heater: bool,

    /// # Feedrate (mm/s)
    /// The extrude speed for the maintenance panel as well for filament swaps.
    #[validate(range(min = 0, message = "Feedrate cannot be less then 0"))]
    pub feedrate: f32,

    /// # Retraction and Re-priming Speed (mm/s)
    /// To prevent dooling during print pausing and resuming set this to a higher feedrate
    /// (eg. 50mm/s) and it will pull the filament away from the hotend on pause and move it back
    /// into the hot end on resume.
    #[serde(default)]
    #[validate(range(min = 0, message = "Retraction speed cannot be less then 0"))]
    pub retraction_speed: f32,

    /// # Pause Retraction Distance (mm)
    /// The distance to retract the filament when pausing a print to prevent drooling.
    /// Before resuming the printer will move the filament back out to it's original position.
    #[serde(default)]
    #[validate(range(min = 0, message = "Pause retraction distance cannot be less then 0"))]
    pub pause_retraction_distance: f32,

    /// # Material
    #[serde(rename = "materialID")]
    pub material_id: Option<crate::DbId>,

    /// # Filament Swap Test Extrude (mm)
    /// Extrudes a small amount of filament to prime the extruder after a filament swap.
    /// Also retracts the filament by this same amount when removing filament.
    #[validate(range(min = 0, message = "Filament swap extrude distance cannot be less then 0"))]
    pub filament_swap_extrude_distance: f32,

    /// # Fast Bowden Tube Priming
    /// Adds an extruder movement before the test extrude to quickly move the filament
    /// from the cold end to the hot end.
    #[serde(default)]
    pub filament_swap_fast_move_enabled: bool,

    /// # Bowden Tube Length (mm)
    #[validate(range(min = 0, message = "Bowden tube length cannot be less then 0"))]
    pub bowden_tube_length: f32,

    /// # Bowden Tube Priming Speed (mm/s)
    /// This should be the maximum non-extruding speed that you can move filament
    /// through the bowden cable.
    #[validate(range(min = 0, message = "Filament swap fast move speed cannot be less then 0"))]
    pub filament_swap_fast_move_speed: Option<f32>,

    /// # Continuous Pull
    /// Continuously moves the extruder to catch and pull the new filament when loading
    /// the next material in the filament swap wizard.
    /// This should only be used on extruders which safeguard against filament jams.
    #[serde(default)]
    pub filament_swap_continuous_pull_enabled: bool,

    /// # Continuous Pull Speed (mm/s)
    /// A slow extrude speed is recommended to gradually pull filament in to the cold end
    /// before the user clicks "Load Filament".
    #[validate(range(min = 0, message = "Filament swap continuous pull speed cannot be less then 0"))]
    pub filament_swap_continuous_pull_speed: Option<f32>,

    /// # Before Filament Swap (GCode)
    pub before_filament_swap_hook: String,
}

impl teg_config_form::Model for ToolheadConfig {
    fn form(_: &Vec<String>) -> Vec<String> {
        vec![
            "name",
            "address",
            "heater",
            "feedrate",
            "retractionSpeed",
            "materialID",
        ]
            .into_iter()
            .map(Into::into)
            .collect()
    }
}

#[derive(Default, Debug, Clone)]
pub struct ToolheadEphemeral {
    pub heater: HeaterEphemeral,
    pub axis: AxisEphemeral,
}

pub type Toolhead = ComponentInner<ToolheadConfig, ToolheadEphemeral>;

impl Toolhead {
    pub async fn set_material<'a>(
        db: &crate::Db,
        machine_config: &'a mut MachineConfig,
        toolhead_id: &crate::DbId,
        material_id: &Option<crate::DbId>,
    ) -> Result<&'a mut Toolhead> {
        // Get the toolhead
        let toolhead = machine_config.toolheads
            .iter_mut()
            .find(|toolhead| {
                &toolhead.id == toolhead_id
            })
            .ok_or_else(|| eyre!("Toolhead not found"))?;

        if let Some(material_id) = material_id {
            // Get the material
            let material = Material::get(db, material_id, true)
                .await?;

            let material = match material.config {
                MaterialConfigEnum::FdmFilament(filament) => filament,
            };

            // Set the material id and extruder temperature
            toolhead.model.material_id = Some(material_id.clone());
            toolhead.ephemeral.heater.material_target = Some(material.target_extruder_temperature);

            // Set the bed target temperature
            for build_platform in &mut machine_config.build_platforms {
                build_platform.ephemeral.material_target = Some(material.target_bed_temperature);
            }
        } else {
            toolhead.model.material_id = None;
            toolhead.ephemeral.heater.material_target = None;
        }

        Ok(toolhead)
    }
}
