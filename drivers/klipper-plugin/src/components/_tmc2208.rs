use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Tmc2208 {
    pub klipper_id: KlipperId,
    /// The pin connected to the TMC2208 PDN_UART line. This parameter
    /// must be provided.
    pub uart_pin: KlipperPin,
    /// If using separate receive and transmit lines to communicate with
    /// the driver then set uart_pin to the receive pin and tx_pin to the
    /// transmit pin. The default is to use uart_pin for both reading and
    /// writing.
    pub tx_pin: Option<KlipperPin>,
    /// A comma separated list of pins to set prior to accessing the
    /// tmc2208 UART. This may be useful for configuring an analog mux for
    /// UART communication. The default is to not configure any pins.
    pub select_pins: Option<f64>,
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
    pub driver_PWM_AUTOGRAD: Option<f64>,
    /// 
    pub driver_PWM_AUTOSCALE: Option<f64>,
    /// 
    pub driver_PWM_LIM: Option<f64>,
    /// 
    pub driver_PWM_REG: Option<f64>,
    /// 
    pub driver_PWM_FREQ: Option<f64>,
    /// 
    pub driver_PWM_GRAD: Option<f64>,
    /// Set the given register during the configuration of the TMC2208
    /// chip. This may be used to set custom motor parameters. The
    /// defaults for each parameter are next to the parameter name in the
    /// above list.
    pub driver_PWM_OFS: Option<f64>,
}
