use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct DelayedGcode {
    pub klipper_id: KlipperId,
    /// A list of G-Code commands to execute when the delay duration has
    /// elapsed. G-Code templates are supported. This parameter must be
    /// provided.
    pub gcode: f64,
    /// The duration of the initial delay (in seconds). If set to a
    /// non-zero value the delayed_gcode will execute the specified number
    /// of seconds after the printer enters the "ready" state. This can be
    /// useful for initialization procedures or a repeating delayed_gcode.
    /// If set to 0 the delayed_gcode will not execute on startup.
    /// Default is 0.
    pub initial_duration: Option<f64>,
}
