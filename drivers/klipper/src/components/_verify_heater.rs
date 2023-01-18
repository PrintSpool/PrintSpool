use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct VerifyHeater {
    pub klipper_id: KlipperId,
    /// The maximum "cumulative temperature error" before raising an
    /// error. Smaller values result in stricter checking and larger
    /// values allow for more time before an error is reported.
    /// Specifically, the temperature is inspected once a second and if it
    /// is close to the target temperature then an internal "error
    /// counter" is reset; otherwise, if the temperature is below the
    /// target range then the counter is increased by the amount the
    /// reported temperature differs from that range. Should the counter
    /// exceed this "max_error" then an error is raised. The default is
    /// 120.
    pub max_error: Option<f64>,
    /// This controls heater verification during initial heating. Smaller
    /// values result in stricter checking and larger values allow for
    /// more time before an error is reported. Specifically, during
    /// initial heating, as long as the heater increases in temperature
    /// within this time frame (specified in seconds) then the internal
    /// "error counter" is reset. The default is 20 seconds for extruders
    /// and 60 seconds for heater_bed.
    pub check_gain_time: Option<f64>,
    /// The maximum temperature difference (in Celsius) to a target
    /// temperature that is considered in range of the target. This
    /// controls the max_error range check. It is rare to customize this
    /// value. The default is 5.
    pub hysteresis: Option<f64>,
    /// The minimum temperature (in Celsius) that the heater must increase
    /// by during the check_gain_time check. It is rare to customize this
    /// value. The default is 2.
    pub heating_gain: Option<f64>,
}
