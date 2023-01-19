use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct HeaterBed {
    /// 
    pub heater_pin: KlipperPin,
    /// 
    pub sensor_type: f64,
    /// 
    pub sensor_pin: KlipperPin,
    /// 
    pub control: f64,
    /// 
    pub min_temp: f64,
    /// See the "extruder" section for a description of the above parameters.
    pub max_temp: f64,
}
