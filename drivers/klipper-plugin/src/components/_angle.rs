use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Angle {
    pub klipper_id: KlipperId,
    /// The type of the magnetic hall sensor chip. Available choices are
    /// "a1333", "as5047d", and "tle5012b". This parameter must be
    /// specified.
    pub sensor_type: f64,
    /// The query period (in seconds) to use during measurements. The
    /// default is 0.000400 (which is 2500 samples per second).
    pub sample_period: Option<f64>,
    /// The name of the stepper that the angle sensor is attached to (eg,
    /// "stepper_x"). Setting this value enables an angle calibration
    /// tool. To use this feature, the Python "numpy" package must be
    /// installed. The default is to not enable angle calibration for the
    /// angle sensor.
    pub stepper: Option<f64>,
    /// The SPI enable pin for the sensor. This parameter must be provided.
    pub cs_pin: KlipperPin,
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
}
