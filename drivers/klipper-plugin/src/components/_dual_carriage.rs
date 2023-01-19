use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct DualCarriage {
    /// The axis this extra carriage is on (either x or y). This parameter
    /// must be provided.
    pub axis: f64,
    /// 
    pub step_pin: Option<KlipperPin>,
    /// 
    pub dir_pin: Option<KlipperPin>,
    /// 
    pub enable_pin: Option<KlipperPin>,
    /// 
    pub microsteps: Option<f64>,
    /// 
    pub rotation_distance: Option<f64>,
    /// 
    pub endstop_pin: Option<KlipperPin>,
    /// 
    pub position_endstop: Option<f64>,
    /// 
    pub position_min: Option<f64>,
    /// See the "stepper" section for the definition of the above parameters.
    pub position_max: Option<f64>,
}
