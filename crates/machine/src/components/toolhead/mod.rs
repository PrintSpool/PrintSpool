mod resolver;

use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

use super::ComponentInner;
use super::HeaterEphemeral;

/// # Toolhead
#[derive(Deserialize, Serialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ToolheadConfig {
    /// # Name
    // TODO: validate: #[schemars(min_length = 1)]
    pub name: String,

    /// # GCode Address
    // TODO: validate: #[schemars(min_length = 1)]
    pub address: String,

    /// Heated Extruder
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
    pub filament_swap_continuous_pull_enabled: bool,

    /// # Continuous Pull Speed (mm/s)
    /// A slow extrude speed is recommended to gradually pull filament in to the cold end
    /// before the user clicks "Load Filament".
    pub filament_swap_continuous_pull_speed: Option<f32>,

    /// # Before Filament Swap (GCode)
    pub before_filament_swap_hook: String,
}

pub type Toolhead = ComponentInner<ToolheadConfig, HeaterEphemeral>;
