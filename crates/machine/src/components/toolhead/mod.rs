use eyre::{
    eyre,
    Result,
    // Context as _,
};
use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use validator::Validate;
use regex::Regex;
use teg_json_store::{ Record as _, JsonRow };
use teg_material::{Material, MaterialConfigEnum};

use crate::machine::MachineData;

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
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ToolheadConfig {
    /// # Name
    #[validate(length(min = 1))]
    pub name: String,

    /// # GCode Address
    #[validate(regex(path = "EXTRUDER_ADDRESS", message = r#"\
        Toolhead address must start with the letter 'e' followed by a number \
        (eg. e1 or e2)\
    "#))]
    pub address: String,

    /// Heated Extruder
    #[serde(default)]
    pub heater: bool,

    /// # Feedrate (mm/s)
    /// The extrude/retract speed for the maintenance panel
    /// as well as the extrude speed for filament swaps.
    pub feedrate: f32,

    /// # Material
    #[serde(rename = "materialID")]
    pub material_id: Option<crate::DbId>,

    /// # Filament Swap Test Extrude (mm)
    /// Extrudes a small amount of filament to prime the extruder after a filament swap.
    /// Also retracts the filament by this same amount when removing filament.
    pub filament_swap_extrude_distance: f32,
    /// # Fast Bowden Tube Priming
    /// Adds an extruder movement before the test extrude to quickly move the filament
    /// from the cold end to the hot end.
    #[serde(default)]
    pub filament_swap_fast_move_enabled: bool,

    /// # Bowden Tube Length (mm)
    pub bowden_tube_length: f32,

    /// # Bowden Tube Priming Speed (mm/s)
    /// This should be the maximum non-extruding speed that you can move filament
    /// through the bowden cable.
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
    pub filament_swap_continuous_pull_speed: Option<f32>,

    /// # Before Filament Swap (GCode)
    pub before_filament_swap_hook: String,
}

#[derive(Default, Debug, Clone)]
pub struct ToolheadEphemeral {
    pub heater: HeaterEphemeral,
    pub axis: AxisEphemeral,
}

pub type Toolhead = ComponentInner<ToolheadConfig, ToolheadEphemeral>;

impl Toolhead {
    pub async fn set_material(
        db: &crate::Db,
        machine: &mut MachineData,
        toolhead_id: &crate::DbId,
        material_id: &Option<crate::DbId>,
    ) -> Result<()> {
        // Get the toolhead
        let toolhead = machine.config.toolheads
            .iter_mut()
            .find(|toolhead| {
                &toolhead.id == toolhead_id
            })
            .ok_or_else(|| eyre!("Toolhead not found"))?;

        if let Some(material_id) = material_id {
            let material_id: crate::DbId = material_id.parse()?;

            // Verify that the material id exists
            let material = sqlx::query_as!(
                JsonRow,
                "SELECT props FROM materials WHERE id = ?",
                material_id,
            )
                .fetch_one(db)
                .await?;

            let material = Material::from_row(material)?;
            let material = match material.config {
                MaterialConfigEnum::FdmFilament(filament) => filament,
            };

            // Set the material id and extruder temperature
            toolhead.model.material_id = Some(material_id);
            toolhead.ephemeral.heater.material_target = Some(material.target_extruder_temperature);

            // Set the bed target temperature
            for build_platform in &mut machine.config.build_platforms {
                build_platform.ephemeral.material_target = Some(material.target_bed_temperature);
            }
        } else {
            toolhead.model.material_id = None;
            toolhead.ephemeral.heater.material_target = None;
        }

        toolhead.model_version += 1;

        Ok(())
    }
}
