use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Tmc2130 {
    pub klipper_id: KlipperId,
    /// The pin corresponding to the TMC2130 chip select line. This pin
    /// will be set to low at the start of SPI messages and raised to high
    /// after the message completes. This parameter must be provided.
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
    /// 
    pub chain_position: Option<f64>,
    /// These parameters configure an SPI daisy chain. The two parameters
    /// define the stepper position in the chain and the total chain length.
    /// Position 1 corresponds to the stepper that connects to the MOSI signal.
    /// The default is to not use an SPI daisy chain.
    pub chain_length: Option<f64>,
    /// If true, enable step interpolation (the driver will internally
    /// step at a rate of 256 micro-steps). This interpolation does
    /// introduce a small systemic positional deviation - see
    /// TMC_Drivers.md for details. The default is True.
    pub interpolate: Option<f64>,
    /// The amount of current (in amps RMS) to configure the driver to use
    /// during stepper movement. This parameter must be provided.
    pub run_current: f64,
    /// The amount of current (in amps RMS) to configure the driver to use
    /// when the stepper is not moving. Setting a hold_current is not
    /// recommended (see TMC_Drivers.md for details). The default is to
    /// not reduce the current.
    pub hold_current: Option<f64>,
    /// The resistance (in ohms) of the motor sense resistor. The default
    /// is 0.110 ohms.
    pub sense_resistor: Option<f64>,
    /// The velocity (in mm/s) to set the "stealthChop" threshold to. When
    /// set, "stealthChop" mode will be enabled if the stepper motor
    /// velocity is below this value. The default is 0, which disables
    /// "stealthChop" mode.
    pub stealthchop_threshold: Option<f64>,
    /// 
    pub driver_MSLUT0: Option<f64>,
    /// 
    pub driver_MSLUT1: Option<f64>,
    /// 
    pub driver_MSLUT2: Option<f64>,
    /// 
    pub driver_MSLUT3: Option<f64>,
    /// 
    pub driver_MSLUT4: Option<f64>,
    /// 
    pub driver_MSLUT5: Option<f64>,
    /// 
    pub driver_MSLUT6: Option<f64>,
    /// 
    pub driver_MSLUT7: Option<f64>,
    /// 
    pub driver_W0: Option<f64>,
    /// 
    pub driver_W1: Option<f64>,
    /// 
    pub driver_W2: Option<f64>,
    /// 
    pub driver_W3: Option<f64>,
    /// 
    pub driver_X1: Option<f64>,
    /// 
    pub driver_X2: Option<f64>,
    /// 
    pub driver_X3: Option<f64>,
    /// 
    pub driver_START_SIN: Option<f64>,
    /// These fields control the Microstep Table registers directly. The optimal
    /// wave table is specific to each motor and might vary with current. An
    /// optimal configuration will have minimal print artifacts caused by
    /// non-linear stepper movement. The values specified above are the default
    /// values used by the driver. The value must be specified as a decimal integer
    /// (hex form is not supported). In order to compute the wave table fields,
    /// see the tmc2130 "Calculation Sheet" from the Trinamic website.
    pub driver_START_SIN90: Option<f64>,
    /// 
    pub driver_IHOLDDELAY: Option<f64>,
    /// 
    pub driver_TPOWERDOWN: Option<f64>,
    /// 
    pub driver_TBL: Option<f64>,
    /// 
    pub driver_TOFF: Option<f64>,
    /// 
    pub driver_HEND: Option<f64>,
    /// 
    pub driver_HSTRT: Option<f64>,
    /// 
    pub driver_PWM_AUTOSCALE: Option<f64>,
    /// 
    pub driver_PWM_FREQ: Option<f64>,
    /// 
    pub driver_PWM_GRAD: Option<f64>,
    /// 
    pub driver_PWM_AMPL: Option<f64>,
    /// Set the given register during the configuration of the TMC2130
    /// chip. This may be used to set custom motor parameters. The
    /// defaults for each parameter are next to the parameter name in the
    /// above list.
    pub driver_SGT: Option<f64>,
    /// 
    pub diag0_pin: Option<KlipperPin>,
    /// The micro-controller pin attached to one of the DIAG lines of the
    /// TMC2130 chip. Only a single diag pin should be specified. The pin
    /// is "active low" and is thus normally prefaced with "^!". Setting
    /// this creates a "tmc2130_stepper_x:virtual_endstop" virtual pin
    /// which may be used as the stepper's endstop_pin. Doing this enables
    /// "sensorless homing". (Be sure to also set driver_SGT to an
    /// appropriate sensitivity value.) The default is to not enable
    /// sensorless homing.
    pub diag1_pin: Option<KlipperPin>,
}
