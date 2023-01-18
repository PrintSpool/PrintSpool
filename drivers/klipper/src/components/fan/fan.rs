use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Print Cooling Fan (0 or 1 per printer)
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Fan {
    /// Output pin controlling the fan. This parameter must be provided.
    pub pin: KlipperPin,
    /// The maximum power (expressed as a value from 0.0 to 1.0) that the
    /// pin may be set to. The value 1.0 allows the pin to be set fully
    /// enabled for extended periods, while a value of 0.5 would allow the
    /// pin to be enabled for no more than half the time. This setting may
    /// be used to limit the total power output (over extended periods) to
    /// the fan. If this value is less than 1.0 then fan speed requests
    /// will be scaled between zero and max_power (for example, if
    /// max_power is .9 and a fan speed of 80% is requested then the fan
    /// power will be set to 72%). The default is 1.0.
    pub max_power: Option<f64>,
    /// The desired fan speed (expressed as a value from 0.0 to 1.0) if
    /// the micro-controller software enters an error state. The default
    /// is 0.
    pub shutdown_speed: Option<f64>,
    /// The amount of time (in seconds) for each PWM power cycle to the
    /// fan. It is recommended this be 10 milliseconds or greater when
    /// using software based PWM. The default is 0.010 seconds.
    pub cycle_time: Option<f64>,
    /// Enable this to use hardware PWM instead of software PWM. Most fans
    /// do not work well with hardware PWM, so it is not recommended to
    /// enable this unless there is an electrical requirement to switch at
    /// very high speeds. When using hardware PWM the actual cycle time is
    /// constrained by the implementation and may be significantly
    /// different than the requested cycle_time. The default is False.
    pub hardware_pwm: Option<f64>,
    /// Time (in seconds) to run the fan at full speed when either first
    /// enabling or increasing it by more than 50% (helps get the fan
    /// spinning). The default is 0.100 seconds.
    pub kick_start_time: Option<f64>,
    /// The minimum input speed which will power the fan (expressed as a
    /// value from 0.0 to 1.0). When a speed lower than off_below is
    /// requested the fan will instead be turned off. This setting may be
    /// used to prevent fan stalls and to ensure kick starts are
    /// effective. The default is 0.0.
    /// This setting should be recalibrated whenever max_power is adjusted.
    /// To calibrate this setting, start with off_below set to 0.0 and the
    /// fan spinning. Gradually lower the fan speed to determine the lowest
    /// input speed which reliably drives the fan without stalls. Set
    /// off_below to the duty cycle corresponding to this value (for
    /// example, 12% -> 0.12) or slightly higher.
    pub off_below: Option<f64>,
    /// Tachometer input pin for monitoring fan speed. A pullup is generally
    /// required. This parameter is optional.
    pub tachometer_pin: Option<KlipperPin>,
    /// When tachometer_pin is specified, this is the number of pulses per
    /// revolution of the tachometer signal. For a BLDC fan this is
    /// normally half the number of poles. The default is 2.
    pub tachometer_ppr: Option<f64>,
    /// When tachometer_pin is specified, this is the polling period of the
    /// tachometer pin, in seconds. The default is 0.0015, which is fast
    /// enough for fans below 10000 RPM at 2 PPR. This must be smaller than
    /// 30/(tachometer_ppr*rpm), with some margin, where rpm is the
    /// maximum speed (in RPM) of the fan.
    pub tachometer_poll_interval: Option<f64>,
    /// Optional pin to enable power to the fan. This can be useful for fans
    /// with dedicated PWM inputs. Some of these fans stay on even at 0% PWM
    /// input. In such a case, the PWM pin can be used normally, and e.g. a
    /// ground-switched FET(standard fan pin) can be used to control power to
    /// the fan.
    pub enable_pin: Option<KlipperPin>,
}
