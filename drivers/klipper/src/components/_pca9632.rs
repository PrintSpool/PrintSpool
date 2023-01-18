use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Pca9632 {
    pub klipper_id: KlipperId,
    /// The i2c address that the chip is using on the i2c bus. This may be
    /// 96, 97, 98, or 99.  The default is 98.
    pub i2c_address: Option<f64>,
    /// 
    pub i2c_mcu: Option<f64>,
    /// 
    pub i2c_bus: Option<f64>,
    /// See the "common I2C settings" section for a description of the
    /// above parameters.
    pub i2c_speed: Option<f64>,
    /// 
    pub scl_pin: Option<KlipperPin>,
    /// Alternatively, if the pca9632 is not connected to a hardware I2C
    /// bus, then one may specify the "clock" (scl_pin) and "data"
    /// (sda_pin) pins. The default is to use hardware I2C.
    pub sda_pin: Option<KlipperPin>,
    /// Set the pixel order of the LED (using a string containing the
    /// letters R, G, B, W). The default is RGBW.
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
