use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Sx1509 {
    pub klipper_id: KlipperId,
    /// I2C address used by this expander. Depending on the hardware
    /// jumpers this is one out of the following addresses: 62 63 112
    /// 113. This parameter must be provided.
    pub i2c_address: f64,
    /// 
    pub i2c_mcu: Option<f64>,
    /// 
    pub i2c_bus: Option<f64>,
    /// See the "common I2C settings" section for a description of the
    /// above parameters.
    pub i2c_speed: Option<f64>,
    /// If the I2C implementation of your micro-controller supports
    /// multiple I2C busses, you may specify the bus name here. The
    /// default is to use the default micro-controller i2c bus.
    pub i2c_bus: Option<f64>,
}
