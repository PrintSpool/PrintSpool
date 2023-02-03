use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct DisplayGlyph {
    pub klipper_id: KlipperId,
    /// The display data, stored as 16 lines consisting of 16 bits (1 per
    /// pixel) where '.' is a blank pixel and '*' is an on pixel (e.g.,
    /// "****************" to display a solid horizontal line).
    /// Alternatively, one can use '0' for a blank pixel and '1' for an on
    /// pixel. Put each display line into a separate config line. The
    /// glyph must consist of exactly 16 lines with 16 bits each. This
    /// parameter is optional.
    pub data: Option<f64>,
    /// Glyph to use on 20x4 hd44780 displays. The glyph must consist of
    /// exactly 8 lines with 5 bits each. This parameter is optional.
    pub hd44780_data: Option<f64>,
    /// The hd44780 hardware index (0..7) to store the glyph at. If
    /// multiple distinct images use the same slot then make sure to only
    /// use one of those images in any given screen. This parameter is
    /// required if hd44780_data is specified.
    pub hd44780_slot: Option<f64>,
}
