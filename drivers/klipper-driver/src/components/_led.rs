use crate::KlipperId;
use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Led {
    pub klipper_id: KlipperId,
    /// 
    pub red_pin: Option<KlipperPin>,
    /// 
    pub green_pin: Option<KlipperPin>,
    /// 
    pub blue_pin: Option<KlipperPin>,
    /// The pin controlling the given LED color. At least one of the above
    /// parameters must be provided.
    pub white_pin: Option<KlipperPin>,
    /// The amount of time (in seconds) per PWM cycle. It is recommended
    /// this be 10 milliseconds or greater when using software based PWM.
    /// The default is 0.010 seconds.
    pub cycle_time: Option<f64>,
    /// Enable this to use hardware PWM instead of software PWM. When
    /// using hardware PWM the actual cycle time is constrained by the
    /// implementation and may be significantly different than the
    /// requested cycle_time. The default is False.
    pub hardware_pwm: Option<f64>,
    /// 
    pub initial_RED: Option<f64>,
    /// 
    pub initial_GREEN: Option<f64>,
    /// 
    pub initial_BLUE: Option<f64>,
    /// Sets the initial LED color. Each value should be between 0.0 and
    /// 1.0. The default for each color is 0.
    pub initial_WHITE: Option<f64>,
}
