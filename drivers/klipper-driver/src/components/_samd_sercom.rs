use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct SamdSercom {
    pub klipper_id: KlipperId,
    /// The name of the sercom bus to configure in the micro-controller.
    /// Available names are "sercom0", "sercom1", etc.. This parameter
    /// must be provided.
    pub sercom: f64,
    /// MOSI pin for SPI communication, or SDA (data) pin for I2C
    /// communication. The pin must have a valid pinmux configuration
    /// for the given SERCOM peripheral. This parameter must be provided.
    pub tx_pin: KlipperPin,
    /// MISO pin for SPI communication. This pin is not used for I2C
    /// communication (I2C uses tx_pin for both sending and receiving).
    /// The pin must have a valid pinmux configuration for the given
    /// SERCOM peripheral. This parameter is optional.
    pub rx_pin: Option<KlipperPin>,
    /// CLK pin for SPI communication, or SCL (clock) pin for I2C
    /// communication. The pin must have a valid pinmux configuration
    /// for the given SERCOM peripheral. This parameter must be provided.
    pub clk_pin: KlipperPin,
}
