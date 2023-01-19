use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct TemperatureSensor {
    pub klipper_id: KlipperId,
    /// 
    pub sensor_type: Option<f64>,
    /// 
    pub sensor_pin: Option<KlipperPin>,
    /// 
    pub min_temp: Option<f64>,
    /// See the "extruder" section for the definition of the above
    /// parameters.
    pub max_temp: Option<f64>,
    /// See the "heater_generic" section for the definition of this
    /// parameter.
    pub gcode_id: Option<f64>,
}
