use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Pca9533 {
    pub klipper_id: KlipperId,
    /// The i2c address that the chip is using on the i2c bus. Use 98 for
    /// the PCA9533/1, 99 for the PCA9533/2. The default is 98.
    pub i2c_address: Option<f64>,
    /// 
    pub i2c_mcu: Option<f64>,
    /// 
    pub i2c_bus: Option<f64>,
    /// See the "common I2C settings" section for a description of the
    /// above parameters.
    pub i2c_speed: Option<f64>,
    /// 
    pub initial_RED: Option<f64>,
    /// 
    pub initial_GREEN: Option<f64>,
    /// 
    pub initial_BLUE: Option<f64>,
    /// See the "led" section for information on these parameters.
    pub initial_WHITE: Option<f64>,
}
