use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct InputShaper {
    /// A frequency (in Hz) of the input shaper for X axis. This is
    /// usually a resonance frequency of X axis that the input shaper
    /// should suppress. For more complex shapers, like 2- and 3-hump EI
    /// input shapers, this parameter can be set from different
    /// considerations. The default value is 0, which disables input
    /// shaping for X axis.
    pub shaper_freq_x: Option<f64>,
    /// A frequency (in Hz) of the input shaper for Y axis. This is
    /// usually a resonance frequency of Y axis that the input shaper
    /// should suppress. For more complex shapers, like 2- and 3-hump EI
    /// input shapers, this parameter can be set from different
    /// considerations. The default value is 0, which disables input
    /// shaping for Y axis.
    pub shaper_freq_y: Option<f64>,
    /// A type of the input shaper to use for both X and Y axes. Supported
    /// shapers are zv, mzv, zvd, ei, 2hump_ei, and 3hump_ei. The default
    /// is mzv input shaper.
    pub shaper_type: Option<f64>,
    /// 
    pub shaper_type_x: Option<f64>,
    /// If shaper_type is not set, these two parameters can be used to
    /// configure different input shapers for X and Y axes. The same
    /// values are supported as for shaper_type parameter.
    pub shaper_type_y: Option<f64>,
    /// 
    pub damping_ratio_x: Option<f64>,
    /// Damping ratios of vibrations of X and Y axes used by input shapers
    /// to improve vibration suppression. Default value is 0.1 which is a
    /// good all-round value for most printers. In most circumstances this
    /// parameter requires no tuning and should not be changed.
    pub damping_ratio_y: Option<f64>,
}
