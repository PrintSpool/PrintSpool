use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Display {
    /// The type of LCD chip in use. This may be "hd44780", "hd44780_spi",
    /// "st7920", "emulated_st7920", "uc1701", "ssd1306", or "sh1106".
    /// See the display sections below for information on each type and
    /// additional parameters they provide. This parameter must be
    /// provided.
    pub lcd_type: f64,
    /// The name of the display_data group to show on the display. This
    /// controls the content of the screen (see the "display_data" section
    /// for more information). The default is _default_20x4 for hd44780
    /// displays and _default_16x4 for other displays.
    pub display_group: Option<f64>,
    /// Timeout for menu. Being inactive this amount of seconds will
    /// trigger menu exit or return to root menu when having autorun
    /// enabled. The default is 0 seconds (disabled)
    pub menu_timeout: Option<f64>,
    /// Name of the main menu section to show when clicking the encoder
    /// on the home screen. The defaults is __main, and this shows the
    /// the default menus as defined in klippy/extras/display/menu.cfg
    pub menu_root: Option<f64>,
    /// When enabled it will reverse up and down directions for list
    /// navigation. The default is False. This parameter is optional.
    pub menu_reverse_navigation: Option<f64>,
    /// The pins connected to encoder. 2 pins must be provided when using
    /// encoder. This parameter must be provided when using menu.
    pub encoder_pins: Option<f64>,
    /// How many steps the encoder emits per detent ("click"). If the
    /// encoder takes two detents to move between entries or moves two
    /// entries from one detent, try changing this. Allowed values are 2
    /// (half-stepping) or 4 (full-stepping). The default is 4.
    pub encoder_steps_per_detent: Option<f64>,
    /// The pin connected to 'enter' button or encoder 'click'. This
    /// parameter must be provided when using menu. The presence of an
    /// 'analog_range_click_pin' config parameter turns this parameter
    /// from digital to analog.
    pub click_pin: Option<KlipperPin>,
    /// The pin connected to 'back' button. This parameter is optional,
    /// menu can be used without it. The presence of an
    /// 'analog_range_back_pin' config parameter turns this parameter from
    /// digital to analog.
    pub back_pin: Option<KlipperPin>,
    /// The pin connected to 'up' button. This parameter must be provided
    /// when using menu without encoder. The presence of an
    /// 'analog_range_up_pin' config parameter turns this parameter from
    /// digital to analog.
    pub up_pin: Option<KlipperPin>,
    /// The pin connected to 'down' button. This parameter must be
    /// provided when using menu without encoder. The presence of an
    /// 'analog_range_down_pin' config parameter turns this parameter from
    /// digital to analog.
    pub down_pin: Option<KlipperPin>,
    /// The pin connected to 'kill' button. This button will call
    /// emergency stop. The presence of an 'analog_range_kill_pin' config
    /// parameter turns this parameter from digital to analog.
    pub kill_pin: Option<KlipperPin>,
    /// The resistance (in ohms) of the pullup attached to the analog
    /// button. The default is 4700 ohms.
    pub analog_pullup_resistor: Option<f64>,
    /// The resistance range for a 'enter' button. Range minimum and
    /// maximum comma-separated values must be provided when using analog
    /// button.
    pub analog_range_click_pin: Option<KlipperPin>,
    /// The resistance range for a 'back' button. Range minimum and
    /// maximum comma-separated values must be provided when using analog
    /// button.
    pub analog_range_back_pin: Option<KlipperPin>,
    /// The resistance range for a 'up' button. Range minimum and maximum
    /// comma-separated values must be provided when using analog button.
    pub analog_range_up_pin: Option<KlipperPin>,
    /// The resistance range for a 'down' button. Range minimum and
    /// maximum comma-separated values must be provided when using analog
    /// button.
    pub analog_range_down_pin: Option<KlipperPin>,
    /// The resistance range for a 'kill' button. Range minimum and
    /// maximum comma-separated values must be provided when using analog
    /// button.
    pub analog_range_kill_pin: Option<KlipperPin>,
}
