use super::Fan;
use crate::HeaterBaseline;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

/// Temperature-triggered cooling fans (one may define any number of
/// sections with a "temperature_fan" prefix). A "temperature fan" is a
/// fan that will be enabled whenever its associated sensor is above a set
/// temperature. By default, a temperature_fan has a shutdown_speed equal
/// to max_power.
///
/// See the [command reference](https://github.com/Klipper3d/klipper/blob/master/docs/G-Codes.md#temperature_fan)
/// for additional information.
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
pub struct TemperatureFan {
    pub klipper_id: String,

    #[serde(flatten)]
    pub fan_baseline: Fan,
    #[serde(flatten)]
    pub heater_baseline: HeaterBaseline,

    ///
    #[serde(rename = "pid_Kp")]
    pub pid_kp: f64,
    ///
    #[serde(rename = "pid_Ki")]
    pub pid_ki: f64,
    /// The proportional (pid_Kp), integral (pid_Ki), and derivative
    /// (pid_Kd) settings for the PID feedback control system. Klipper
    /// evaluates the PID settings with the following general formula:
    /// fan_pwm = max_power - (Kp*e + Ki*integral(e) - Kd*derivative(e)) / 255
    /// Where "e" is "target_temperature - measured_temperature" and
    /// "fan_pwm" is the requested fan rate with 0.0 being full off and
    /// 1.0 being full on. The pid_Kp, pid_Ki, and pid_Kd parameters must
    /// be provided when the PID control algorithm is enabled.
    #[serde(rename = "pid_Kd")]
    pub pid_Kd: Option<f64>,
    /// A time value (in seconds) over which temperature measurements will
    /// be smoothed when using the PID control algorithm. This may reduce
    /// the impact of measurement noise. The default is 2 seconds.
    pub pid_deriv_time: Option<f64>,
    /// A temperature (in Celsius) that will be the target temperature.
    /// The default is 40 degrees.
    pub target_temp: Option<f64>,
    /// The fan speed (expressed as a value from 0.0 to 1.0) that the fan
    /// will be set to when the sensor temperature exceeds the set value.
    /// The default is 1.0.
    pub max_speed: Option<f64>,
    /// The minimum fan speed (expressed as a value from 0.0 to 1.0) that
    /// the fan will be set to for PID temperature fans.
    /// The default is 0.3.
    pub min_speed: Option<f64>,
    /// If set, the temperature will be reported in M105 queries using the
    /// given id. The default is to not report the temperature via M105.
    pub gcode_id: Option<String>,
}
