use printspool_proc_macros::define_component;
#[define_component]
pub struct VirtualSdcard {
    /// The path of the local directory on the host machine to look for
    /// g-code files. This is a read-only directory (sdcard file writes
    /// are not supported). One may point this to OctoPrint's upload
    /// directory (generally ~/.octoprint/uploads/ ). This parameter must
    /// be provided.
    pub path: f64,
    /// A list of G-Code commands to execute when an error is reported.
    pub on_error_gcode: Option<f64>,
}
