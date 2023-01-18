use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct OutputPin {
    pub klipper_id: KlipperId,
    /// The pin to configure as an output. This parameter must be
    /// provided.
    pub pin: KlipperPin,
    /// Set if the output pin should be capable of pulse-width-modulation.
    /// If this is true, the value fields should be between 0 and 1; if it
    /// is false the value fields should be either 0 or 1. The default is
    /// False.
    pub pwm: Option<f64>,
    /// If this is set, then the pin is assigned to this value at startup
    /// and the pin can not be changed during runtime. A static pin uses
    /// slightly less ram in the micro-controller. The default is to use
    /// runtime configuration of pins.
    pub static_value: Option<f64>,
    /// The value to initially set the pin to during MCU configuration.
    /// The default is 0 (for low voltage).
    pub value: Option<f64>,
    /// The value to set the pin to on an MCU shutdown event. The default
    /// is 0 (for low voltage).
    pub shutdown_value: Option<f64>,
    /// The maximum duration a non-shutdown value may be driven by the MCU
    /// without an acknowledge from the host.
    /// If host can not keep up with an update, the MCU will shutdown
    /// and set all pins to their respective shutdown values.
    /// Default: 0 (disabled)
    /// Usual values are around 5 seconds.
    pub maximum_mcu_duration: Option<f64>,
    /// The amount of time (in seconds) per PWM cycle. It is recommended
    /// this be 10 milliseconds or greater when using software based PWM.
    /// The default is 0.100 seconds for pwm pins.
    pub cycle_time: Option<f64>,
    /// Enable this to use hardware PWM instead of software PWM. When
    /// using hardware PWM the actual cycle time is constrained by the
    /// implementation and may be significantly different than the
    /// requested cycle_time. The default is False.
    pub hardware_pwm: Option<f64>,
    /// This parameter can be used to alter how the 'value' and
    /// 'shutdown_value' parameters are interpreted for pwm pins. If
    /// provided, then the 'value' parameter should be between 0.0 and
    /// 'scale'. This may be useful when configuring a PWM pin that
    /// controls a stepper voltage reference. The 'scale' can be set to
    /// the equivalent stepper amperage if the PWM were fully enabled, and
    /// then the 'value' parameter can be specified using the desired
    /// amperage for the stepper. The default is to not scale the 'value'
    /// parameter.
    pub scale: Option<f64>,
}
