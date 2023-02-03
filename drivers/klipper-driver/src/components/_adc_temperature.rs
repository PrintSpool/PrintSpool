use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct AdcTemperature {
    pub klipper_id: KlipperId,
    /// 
    pub temperature1: Option<f64>,
    /// 
    pub voltage1: Option<f64>,
    /// 
    pub temperature2: Option<f64>,
    /// A set of temperatures (in Celsius) and voltages (in Volts) to use
    /// as reference when converting a temperature. A heater section using
    /// this sensor may also specify adc_voltage and voltage_offset
    /// parameters to define the ADC voltage (see "Common temperature
    /// amplifiers" section for details). At least two measurements must
    /// be provided.
    pub voltage2: Option<f64>,
    /// 
    pub temperature1: Option<f64>,
    /// 
    pub resistance1: Option<f64>,
    /// 
    pub temperature2: Option<f64>,
    /// Alternatively one may specify a set of temperatures (in Celsius)
    /// and resistance (in Ohms) to use as reference when converting a
    /// temperature. A heater section using this sensor may also specify a
    /// pullup_resistor parameter (see "extruder" section for details). At
    /// least two measurements must be provided.
    pub resistance2: Option<f64>,
}
