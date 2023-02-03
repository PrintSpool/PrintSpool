use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Mcp4728 {
    pub klipper_id: KlipperId,
    /// The i2c address that the chip is using on the i2c bus. The default
    /// is 96.
    pub i2c_address: Option<f64>,
    /// 
    pub i2c_mcu: Option<f64>,
    /// 
    pub i2c_bus: Option<f64>,
    /// See the "common I2C settings" section for a description of the
    /// above parameters.
    pub i2c_speed: Option<f64>,
    /// 
    pub channel_a: Option<f64>,
    /// 
    pub channel_b: Option<f64>,
    /// 
    pub channel_c: Option<f64>,
    /// The value to statically set the given MCP4728 channel to. This is
    /// typically set to a number between 0.0 and 1.0 with 1.0 being the
    /// highest voltage (2.048V) and 0.0 being the lowest voltage.
    /// However, the range may be changed with the 'scale' parameter (see
    /// below). If a channel is not specified then it is left
    /// unconfigured.
    pub channel_d: Option<f64>,
    /// This parameter can be used to alter how the 'channel_x' parameters
    /// are interpreted. If provided, then the 'channel_x' parameters
    /// should be between 0.0 and 'scale'. This may be useful when the
    /// MCP4728 is used to set stepper voltage references. The 'scale' can
    /// be set to the equivalent stepper amperage if the MCP4728 were at
    /// its highest voltage (2.048V), and then the 'channel_x' parameters
    /// can be specified using the desired amperage value for the
    /// stepper. The default is to not scale the 'channel_x' parameters.
    pub scale: Option<f64>,
}
