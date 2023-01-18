use crate::KlipperId;
use crate::KlipperPin;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Tmc2209 {
    pub klipper_id: KlipperId,
    /// 
    pub uart_pin: KlipperPin,
    /// 
    pub tx_pin: Option<KlipperPin>,
    /// 
    pub select_pins: Option<f64>,
    /// 
    pub interpolate: Option<f64>,
    /// 
    pub run_current: f64,
    /// 
    pub hold_current: Option<f64>,
    /// 
    pub sense_resistor: Option<f64>,
    /// See the "tmc2208" section for the definition of these parameters.
    pub stealthchop_threshold: Option<f64>,
    /// The address of the TMC2209 chip for UART messages (an integer
    /// between 0 and 3). This is typically used when multiple TMC2209
    /// chips are connected to the same UART pin. The default is zero.
    pub uart_address: Option<f64>,
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
    /// 
    pub driver_PWM_OFS: Option<f64>,
    /// Set the given register during the configuration of the TMC2209
    /// chip. This may be used to set custom motor parameters. The
    /// defaults for each parameter are next to the parameter name in the
    /// above list.
    pub driver_SGTHRS: Option<f64>,
    /// The micro-controller pin attached to the DIAG line of the TMC2209
    /// chip. The pin is normally prefaced with "^" to enable a pullup.
    /// Setting this creates a "tmc2209_stepper_x:virtual_endstop" virtual
    /// pin which may be used as the stepper's endstop_pin. Doing this
    /// enables "sensorless homing". (Be sure to also set driver_SGTHRS to
    /// an appropriate sensitivity value.) The default is to not enable
    /// sensorless homing.
    pub diag_pin: Option<KlipperPin>,
}
