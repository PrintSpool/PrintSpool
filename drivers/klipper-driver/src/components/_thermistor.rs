use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Thermistor {
    pub klipper_id: KlipperId,
    /// 
    pub temperature1: Option<f64>,
    /// 
    pub resistance1: Option<f64>,
    /// 
    pub temperature2: Option<f64>,
    /// 
    pub resistance2: Option<f64>,
    /// 
    pub temperature3: Option<f64>,
    /// Three resistance measurements (in Ohms) at the given temperatures
    /// (in Celsius). The three measurements will be used to calculate the
    /// Steinhart-Hart coefficients for the thermistor. These parameters
    /// must be provided when using Steinhart-Hart to define the
    /// thermistor.
    pub resistance3: Option<f64>,
    /// Alternatively, one may define temperature1, resistance1, and beta
    /// to define the thermistor parameters. This parameter must be
    /// provided when using "beta" to define the thermistor.
    pub beta: Option<f64>,
}
