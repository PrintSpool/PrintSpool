use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct HeaterGeneric {
    pub klipper_id: KlipperId,
    /// The id to use when reporting the temperature in the M105 command.
    /// This parameter must be provided.
    pub gcode_id: Option<f64>,
    /// 
    pub heater_pin: Option<KlipperPin>,
    /// 
    pub max_power: Option<f64>,
    /// 
    pub sensor_type: Option<f64>,
    /// 
    pub sensor_pin: Option<KlipperPin>,
    /// 
    pub smooth_time: Option<f64>,
    /// 
    pub control: Option<f64>,
    /// 
    pub pid_Kp: Option<f64>,
    /// 
    pub pid_Ki: Option<f64>,
    /// 
    pub pid_Kd: Option<f64>,
    /// 
    pub pwm_cycle_time: Option<f64>,
    /// 
    pub min_temp: Option<f64>,
    /// See the "extruder" section for the definition of the above
    /// parameters.
    pub max_temp: Option<f64>,
}
