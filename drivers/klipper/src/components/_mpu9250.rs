use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Mpu9250 {
    pub klipper_id: KlipperId,
    /// Default is 104 (0x68). If AD0 is high, it would be 0x69 instead.
    pub i2c_address: Option<f64>,
    /// 
    pub i2c_mcu: Option<f64>,
    /// 
    pub i2c_bus: Option<f64>,
    /// See the "common I2C settings" section for a description of the
    /// above parameters. The default "i2c_speed" is 400000.
    pub i2c_speed: Option<f64>,
    /// See the "adxl345" section for information on this parameter.
    pub axes_map: Option<f64>,
}
