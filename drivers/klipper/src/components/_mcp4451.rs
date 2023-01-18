use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Mcp4451 {
    pub klipper_id: KlipperId,
    /// The i2c address that the chip is using on the i2c bus. This
    /// parameter must be provided.
    pub i2c_address: f64,
    /// 
    pub i2c_mcu: Option<f64>,
    /// 
    pub i2c_bus: Option<f64>,
    /// See the "common I2C settings" section for a description of the
    /// above parameters.
    pub i2c_speed: Option<f64>,
    /// 
    pub wiper_0: Option<f64>,
    /// 
    pub wiper_1: Option<f64>,
    /// 
    pub wiper_2: Option<f64>,
    /// The value to statically set the given MCP4451 "wiper" to. This is
    /// typically set to a number between 0.0 and 1.0 with 1.0 being the
    /// highest resistance and 0.0 being the lowest resistance. However,
    /// the range may be changed with the 'scale' parameter (see below).
    /// If a wiper is not specified then it is left unconfigured.
    pub wiper_3: Option<f64>,
    /// This parameter can be used to alter how the 'wiper_x' parameters
    /// are interpreted. If provided, then the 'wiper_x' parameters should
    /// be between 0.0 and 'scale'. This may be useful when the MCP4451 is
    /// used to set stepper voltage references. The 'scale' can be set to
    /// the equivalent stepper amperage if the MCP4451 were at its highest
    /// resistance, and then the 'wiper_x' parameters can be specified
    /// using the desired amperage value for the stepper. The default is
    /// to not scale the 'wiper_x' parameters.
    pub scale: Option<f64>,
}
