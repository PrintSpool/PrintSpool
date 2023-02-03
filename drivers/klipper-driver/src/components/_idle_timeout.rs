use printspool_proc_macros::define_component;
#[define_component]
pub struct IdleTimeout {
    /// A list of G-Code commands to execute on an idle timeout. See
    /// docs/Command_Templates.md for G-Code format. The default is to run
    /// "TURN_OFF_HEATERS" and "M84".
    pub gcode: Option<f64>,
    /// Idle time (in seconds) to wait before running the above G-Code
    /// commands. The default is 600 seconds.
    pub timeout: Option<f64>,
}
