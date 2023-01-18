use super::Fan;
use crate::{KlipperId, KlipperIdList};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Controller cooling fan (one may define any number of sections with a
/// "controller_fan" prefix). A "controller fan" is a fan that will be
/// enabled whenever its associated heater or its associated stepper
/// driver is active. The fan will stop whenever an idle_timeout is
/// reached to ensure no overheating will occur after deactivating a
/// watched component.
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct ControllerFan {
    pub klipper_id: KlipperId,

    #[serde(flatten)]
    pub baseline_config: Fan,

    /// The fan speed (expressed as a value from 0.0 to 1.0) that the fan
    /// will be set to when a heater or stepper driver is active.
    /// The default is 1.0
    pub fan_speed: Option<f64>,
    /// The amount of time (in seconds) after a stepper driver or heater
    /// was active and the fan should be kept running. The default
    /// is 30 seconds.
    pub idle_timeout: Option<f64>,
    /// The fan speed (expressed as a value from 0.0 to 1.0) that the fan
    /// will be set to when a heater or stepper driver was active and
    /// before the idle_timeout is reached. The default is fan_speed.
    pub idle_speed: Option<f64>,
    /// Name of the config section defining the heater that this fan is
    /// associated with. If a comma separated list of heater names is
    /// provided here, then the fan will be enabled when any of the given
    /// heaters are enabled. The default is "extruder".
    pub heater: Option<KlipperIdList>,
    /// Name of the config section defining the heater/stepper that this fan
    /// is associated with. If a comma separated list of heater/stepper names
    /// is provided here, then the fan will be enabled when any of the given
    /// heaters/steppers are enabled. The default heater is "extruder", the
    /// default stepper is all of them.
    pub stepper: Option<KlipperIdList>,
}
