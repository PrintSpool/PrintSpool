use super::Fan;
use crate::{KlipperId, KlipperIdList};
use printspool_proc_macros::define_component;

/// Heater cooling fans (one may define any number of sections with a
/// "heater_fan" prefix). A "heater fan" is a fan that will be enabled
/// whenever its associated heater is active. By default, a heater_fan has
/// a shutdown_speed equal to max_power.
#[define_component]
pub struct HeaterFan {
    pub klipper_id: KlipperId,

    #[serde(flatten)]
    pub baseline_config: Fan,

    /// Name of the config section defining the heater that this fan is
    /// associated with. If a comma separated list of heater names is
    /// provided here, then the fan will be enabled when any of the given
    /// heaters are enabled. The default is "extruder".
    pub heater: Option<KlipperIdList>,
    /// A temperature (in Celsius) that the heater must drop below before
    /// the fan is disabled. The default is 50 Celsius.
    pub heater_temp: Option<f64>,
    /// The fan speed (expressed as a value from 0.0 to 1.0) that the fan
    /// will be set to when its associated heater is enabled. The default
    /// is 1.0
    pub fan_speed: Option<f64>,
}
