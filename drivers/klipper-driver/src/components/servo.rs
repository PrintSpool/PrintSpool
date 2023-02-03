use crate::KlipperPin;
use printspool_proc_macros::define_component;

#[define_component]
pub struct Servo {
    /// PWM output pin controlling the servo. This parameter must be
    /// provided.
    pub pin: KlipperPin,
    /// The maximum angle (in degrees) that this servo can be set to. The
    /// default is 180 degrees.
    pub maximum_servo_angle: Option<f64>,
    /// The minimum pulse width time (in seconds). This should correspond
    /// with an angle of 0 degrees. The default is 0.001 seconds.
    pub minimum_pulse_width: Option<f64>,
    /// The maximum pulse width time (in seconds). This should correspond
    /// with an angle of maximum_servo_angle. The default is 0.002
    /// seconds.
    pub maximum_pulse_width: Option<f64>,
    /// Initial angle (in degrees) to set the servo to. The default is to
    /// not send any signal at startup.
    pub initial_angle: Option<f64>,
    /// Initial pulse width time (in seconds) to set the servo to. (This
    /// is only valid if initial_angle is not set.) The default is to not
    /// send any signal at startup.
    pub initial_pulse_width: Option<f64>,
}
