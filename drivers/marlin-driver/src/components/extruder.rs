use super::ComponentInner;
use super::{AxisEphemeral, HeaterEphemeral};
use crate::config::MachineConfig;
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use printspool_json_store::Record as _;
use printspool_material::{Material, MaterialConfigEnum};
use printspool_proc_macros::define_component;
use regex::Regex;

lazy_static! {
    static ref EXTRUDER_ADDRESS: Regex = Regex::new(r"^e\d+$").unwrap();
}

/// # Toolhead
#[define_component]
pub struct Extruder {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # GCode Address
    #[validate(regex(
        path = "EXTRUDER_ADDRESS",
        message = r#"
        Toolhead address must start with the letter 'e' followed by a number
        (eg. e1 or e2)
    "#
    ))]
    pub address: String,

    /// # Heated Extruder
    #[serde(default)]
    pub heater: bool,

    /// # Feedrate (mm/s)
    /// The extrude speed for the maintenance panel as well for filament swaps.
    #[validate(range(min = 0, message = "Feedrate cannot be less then 0"))]
    pub feedrate: f32,

    /// # Retraction and Re-priming Speed (mm/s)
    /// To prevent drooling during print pausing and resuming set this to a higher feedrate
    /// (eg. 50mm/s) and it will pull the filament away from the hotend on pause and move it back
    /// into the hot end on resume.
    #[validate(range(min = 0, message = "Retraction speed cannot be less then 0"))]
    pub retraction_speed: f32,

    /// # Pause Retraction Distance (mm)
    /// The distance to retract the filament when pausing a print to prevent drooling.
    /// Before resuming the printer will move the filament back out to it's original position.
    #[serde(default)]
    #[validate(range(min = 0, message = "Pause retraction distance cannot be less then 0"))]
    pub pause_retraction_distance: f32,

    /// # Material
    #[serde(default)]
    #[serde(rename = "materialID")]
    pub material_id: Option<crate::DbId>,

    /// # Filament Swap Test Extrude (mm)
    /// Extrudes a small amount of filament to prime the extruder after a filament swap.
    /// Also retracts the filament by this same amount when removing filament.
    #[serde(default)]
    #[validate(range(
        min = 0,
        message = "Filament swap extrude distance cannot be less then 0"
    ))]
    pub filament_swap_extrude_distance: f32,

    /// # Fast Bowden Tube Priming
    /// Adds an extruder movement before the test extrude to quickly move the filament
    /// from the cold end to the hot end.
    #[serde(default)]
    pub filament_swap_fast_move_enabled: bool,

    /// # Bowden Tube Length (mm)
    #[serde(default)]
    #[validate(range(min = 0, message = "Bowden tube length cannot be less then 0"))]
    pub bowden_tube_length: f32,

    /// # Bowden Tube Priming Speed (mm/s)
    /// This should be the maximum non-extruding speed that you can move filament
    /// through the bowden cable.
    #[serde(default)]
    #[validate(range(
        min = 0,
        message = "Filament swap fast move speed cannot be less then 0"
    ))]
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
    #[serde(default)]
    #[validate(range(
        min = 0,
        message = "Filament swap continuous pull speed cannot be less then 0"
    ))]
    pub filament_swap_continuous_pull_speed: Option<f32>,

    /// # Before Filament Swap (GCode)
    #[serde(default)]
    pub before_filament_swap_hook: String,
}

impl Extruder {
    pub fn type_descriptor() -> ComponentTypeDescriptor {
        ComponentTypeDescriptor {
            name: "MARLIN_EXTRUDER",
            display_name: "extruder",
            fixed_list: true,
        }
    }
}

impl printspool_config_form::Model for Extruder {
    fn static_form() -> Option<Vec<&'static str>> {
        Some(vec![
            "name",
            "address",
            "heater",
            "feedrate",
            "retractionSpeed",
            "materialID",
        ])
    }

    fn static_advanced_form() -> Option<Vec<&'static str>> {
        Some(vec![
            "pauseRetractionDistance",
            "filamentSwapExtrudeDistance",
            "filamentSwapFastMoveEnabled",
            "bowdenTubeLength",
            "filamentSwapFastMoveSpeed",
            "filamentSwapContinuousPullEnabled",
            "filamentSwapContinuousPullSpeed",
            "beforeFilamentSwapHook",
        ])
    }
}
