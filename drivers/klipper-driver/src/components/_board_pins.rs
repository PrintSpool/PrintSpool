use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct BoardPins {
    pub klipper_id: KlipperId,
    /// A comma separated list of micro-controllers that may use the
    /// aliases. The default is to apply the aliases to the main "mcu".
    pub mcu: f64,
    /// A comma separated list of "name=value" aliases to create for the
    /// given micro-controller. For example, "EXP1_1=PE6" would create an
    /// "EXP1_1" alias for the "PE6" pin. However, if "value" is enclosed
    /// in "<>" then "name" is created as a reserved pin (for example,
    /// "EXP1_9=<GND>" would reserve "EXP1_9"). Any number of options
    /// starting with "aliases_" may be specified.
    pub aliases: f64,
}
