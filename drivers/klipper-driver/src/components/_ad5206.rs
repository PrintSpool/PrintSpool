use crate::KlipperId;
use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Ad5206 {
    pub klipper_id: KlipperId,
    /// The pin corresponding to the AD5206 chip select line. This pin
    /// will be set to low at the start of SPI messages and raised to high
    /// after the message completes. This parameter must be provided.
    pub enable_pin: KlipperPin,
    /// 
    pub spi_speed: Option<f64>,
    /// 
    pub spi_bus: Option<f64>,
    /// 
    pub spi_software_sclk_pin: Option<KlipperPin>,
    /// 
    pub spi_software_mosi_pin: Option<KlipperPin>,
    /// See the "common SPI settings" section for a description of the
    /// above parameters.
    pub spi_software_miso_pin: Option<KlipperPin>,
    /// 
    pub channel_1: Option<f64>,
    /// 
    pub channel_2: Option<f64>,
    /// 
    pub channel_3: Option<f64>,
    /// 
    pub channel_4: Option<f64>,
    /// 
    pub channel_5: Option<f64>,
    /// The value to statically set the given AD5206 channel to. This is
    /// typically set to a number between 0.0 and 1.0 with 1.0 being the
    /// highest resistance and 0.0 being the lowest resistance. However,
    /// the range may be changed with the 'scale' parameter (see below).
    /// If a channel is not specified then it is left unconfigured.
    pub channel_6: Option<f64>,
    /// This parameter can be used to alter how the 'channel_x' parameters
    /// are interpreted. If provided, then the 'channel_x' parameters
    /// should be between 0.0 and 'scale'. This may be useful when the
    /// AD5206 is used to set stepper voltage references. The 'scale' can
    /// be set to the equivalent stepper amperage if the AD5206 were at
    /// its highest resistance, and then the 'channel_x' parameters can be
    /// specified using the desired amperage value for the stepper. The
    /// default is to not scale the 'channel_x' parameters.
    pub scale: Option<f64>,
}
