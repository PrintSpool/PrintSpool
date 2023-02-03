use crate::KlipperId;
use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct AdcScaled {
    pub klipper_id: KlipperId,
    /// The ADC pin to use for VREF monitoring. This parameter must be
    /// provided.
    pub vref_pin: KlipperPin,
    /// The ADC pin to use for VSSA monitoring. This parameter must be
    /// provided.
    pub vssa_pin: KlipperPin,
    /// A time value (in seconds) over which the vref and vssa
    /// measurements will be smoothed to reduce the impact of measurement
    /// noise. The default is 2 seconds.
    pub smooth_time: Option<f64>,
}
