use printspool_proc_macros::define_component;
#[define_component]
pub struct Palette2 {
    /// The serial port to connect to the Palette 2.
    pub serial: f64,
    /// The baud rate to use. The default is 115200.
    pub baud: Option<f64>,
    /// The feedrate to use when splicing, default is 0.8
    pub feedrate_splice: Option<f64>,
    /// The feedrate to use after splicing, default is 1.0
    pub feedrate_normal: Option<f64>,
    /// Extrude feedrate when autoloading, default is 2 (mm/s)
    pub auto_load_speed: Option<f64>,
    /// Auto cancel print when ping varation is above this threshold
    pub auto_cancel_variation: Option<f64>,
}
