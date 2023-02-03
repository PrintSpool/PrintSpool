use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Adxl345 {
    /// The SPI enable pin for the sensor. This parameter must be provided.
    pub cs_pin: KlipperPin,
    /// The SPI speed (in hz) to use when communicating with the chip.
    /// The default is 5000000.
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
    /// The accelerometer axis for each of the printer's X, Y, and Z axes.
    /// This may be useful if the accelerometer is mounted in an
    /// orientation that does not match the printer orientation. For
    /// example, one could set this to "y, x, z" to swap the X and Y axes.
    /// It is also possible to negate an axis if the accelerometer
    /// direction is reversed (eg, "x, z, -y"). The default is "x, y, z".
    pub axes_map: Option<f64>,
    /// Output data rate for ADXL345. ADXL345 supports the following data
    /// rates: 3200, 1600, 800, 400, 200, 100, 50, and 25. Note that it is
    /// not recommended to change this rate from the default 3200, and
    /// rates below 800 will considerably affect the quality of resonance
    /// measurements.
    pub rate: Option<f64>,
}
