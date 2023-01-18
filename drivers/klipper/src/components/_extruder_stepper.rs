use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct ExtruderStepper {
    pub klipper_id: KlipperId,
    /// The extruder this stepper is synchronized to. If this is set to an
    /// empty string then the stepper will not be synchronized to an
    /// extruder. This parameter must be provided.
    pub extruder: f64,
    /// 
    pub step_pin: Option<KlipperPin>,
    /// 
    pub dir_pin: Option<KlipperPin>,
    /// 
    pub enable_pin: Option<KlipperPin>,
    /// 
    pub microsteps: Option<f64>,
    /// See the "stepper" section for the definition of the above
    /// parameters.
    pub rotation_distance: Option<f64>,
}
