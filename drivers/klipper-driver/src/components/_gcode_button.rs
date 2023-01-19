use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct GcodeButton {
    pub klipper_id: KlipperId,
    /// The pin on which the button is connected. This parameter must be
    /// provided.
    pub pin: KlipperPin,
    /// Two comma separated resistances (in Ohms) specifying the minimum
    /// and maximum resistance range for the button. If analog_range is
    /// provided then the pin must be an analog capable pin. The default
    /// is to use digital gpio for the button.
    pub analog_range: Option<f64>,
    /// The pullup resistance (in Ohms) when analog_range is specified.
    /// The default is 4700 ohms.
    pub analog_pullup_resistor: Option<f64>,
    /// A list of G-Code commands to execute when the button is pressed.
    /// G-Code templates are supported. This parameter must be provided.
    pub press_gcode: Option<f64>,
    /// A list of G-Code commands to execute when the button is released.
    /// G-Code templates are supported. The default is to not run any
    /// commands on a button release.
    pub release_gcode: Option<f64>,
}
