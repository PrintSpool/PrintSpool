use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Tmc2660 {
    pub klipper_id: KlipperId,
    /// The pin corresponding to the TMC2660 chip select line. This pin
    /// will be set to low at the start of SPI messages and set to high
    /// after the message transfer completes. This parameter must be
    /// provided.
    pub cs_pin: KlipperPin,
    /// SPI bus frequency used to communicate with the TMC2660 stepper
    /// driver. The default is 4000000.
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
    /// If true, enable step interpolation (the driver will internally
    /// step at a rate of 256 micro-steps). This only works if microsteps
    /// is set to 16. Interpolation does introduce a small systemic
    /// positional deviation - see TMC_Drivers.md for details. The default
    /// is True.
    pub interpolate: Option<f64>,
    /// The amount of current (in amps RMS) used by the driver during
    /// stepper movement. This parameter must be provided.
    pub run_current: f64,
    /// The resistance (in ohms) of the motor sense resistor. This
    /// parameter must be provided.
    pub sense_resistor: Option<f64>,
    /// The percentage of the run_current the stepper driver will be
    /// lowered to when the idle timeout expires (you need to set up the
    /// timeout using a [idle_timeout] config section). The current will
    /// be raised again once the stepper has to move again. Make sure to
    /// set this to a high enough value such that the steppers do not lose
    /// their position. There is also small delay until the current is
    /// raised again, so take this into account when commanding fast moves
    /// while the stepper is idling. The default is 100 (no reduction).
    pub idle_current_percent: Option<f64>,
    /// 
    pub driver_TBL: Option<f64>,
    /// 
    pub driver_RNDTF: Option<f64>,
    /// 
    pub driver_HDEC: Option<f64>,
    /// 
    pub driver_CHM: Option<f64>,
    /// 
    pub driver_HEND: Option<f64>,
    /// 
    pub driver_HSTRT: Option<f64>,
    /// 
    pub driver_TOFF: Option<f64>,
    /// 
    pub driver_SEIMIN: Option<f64>,
    /// 
    pub driver_SEDN: Option<f64>,
    /// 
    pub driver_SEMAX: Option<f64>,
    /// 
    pub driver_SEUP: Option<f64>,
    /// 
    pub driver_SEMIN: Option<f64>,
    /// 
    pub driver_SFILT: Option<f64>,
    /// 
    pub driver_SGT: Option<f64>,
    /// 
    pub driver_SLPH: Option<f64>,
    /// 
    pub driver_SLPL: Option<f64>,
    /// 
    pub driver_DISS2G: Option<f64>,
    /// Set the given parameter during the configuration of the TMC2660
    /// chip. This may be used to set custom driver parameters. The
    /// defaults for each parameter are next to the parameter name in the
    /// list above. See the TMC2660 datasheet about what each parameter
    /// does and what the restrictions on parameter combinations are. Be
    /// especially aware of the CHOPCONF register, where setting CHM to
    /// either zero or one will lead to layout changes (the first bit of
    /// HDEC) is interpreted as the MSB of HSTRT in this case).
    pub driver_TS2G: Option<f64>,
}
