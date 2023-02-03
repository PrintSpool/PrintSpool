use crate::KlipperId;
use crate::KlipperPin;
use printspool_proc_macros::define_component;
#[define_component]
pub struct Mcp4018 {
    pub klipper_id: KlipperId,
    /// The SCL "clock" pin. This parameter must be provided.
    pub scl_pin: KlipperPin,
    /// The SDA "data" pin. This parameter must be provided.
    pub sda_pin: KlipperPin,
    /// The value to statically set the given MCP4018 "wiper" to. This is
    /// typically set to a number between 0.0 and 1.0 with 1.0 being the
    /// highest resistance and 0.0 being the lowest resistance. However,
    /// the range may be changed with the 'scale' parameter (see below).
    /// This parameter must be provided.
    pub wiper: f64,
    /// This parameter can be used to alter how the 'wiper' parameter is
    /// interpreted. If provided, then the 'wiper' parameter should be
    /// between 0.0 and 'scale'. This may be useful when the MCP4018 is
    /// used to set stepper voltage references. The 'scale' can be set to
    /// the equivalent stepper amperage if the MCP4018 is at its highest
    /// resistance, and then the 'wiper' parameter can be specified using
    /// the desired amperage value for the stepper. The default is to not
    /// scale the 'wiper' parameter.
    pub scale: Option<f64>,
}
