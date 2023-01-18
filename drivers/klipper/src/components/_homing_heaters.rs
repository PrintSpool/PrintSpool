use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct HomingHeaters {
    /// A comma separated list of steppers that should cause heaters to be
    /// disabled. The default is to disable heaters for any homing/probing
    /// move.
    /// Typical example: stepper_z
    pub steppers: Option<f64>,
    /// A comma separated list of heaters to disable during homing/probing
    /// moves. The default is to disable all heaters.
    /// Typical example: extruder, heater_bed
    pub heaters: Option<f64>,
}
