use crate::KlipperId;
use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Neopixel {
    pub klipper_id: KlipperId,
    /// The pin connected to the neopixel. This parameter must be
    /// provided.
    pub pin: KlipperPin,
    /// The number of Neopixel chips that are "daisy chained" to the
    /// provided pin. The default is 1 (which indicates only a single
    /// Neopixel is connected to the pin).
    pub chain_count: Option<f64>,
    /// Set the pixel order required by the LED hardware (using a string
    /// containing the letters R, G, B, W with W optional). Alternatively,
    /// this may be a comma separated list of pixel orders - one for each
    /// LED in the chain. The default is GRB.
    pub color_order: Option<f64>,
    /// 
    pub initial_RED: Option<f64>,
    /// 
    pub initial_GREEN: Option<f64>,
    /// 
    pub initial_BLUE: Option<f64>,
    /// See the "led" section for information on these parameters.
    pub initial_WHITE: Option<f64>,
}
