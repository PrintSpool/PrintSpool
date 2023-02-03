use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct MultiPin {
    pub klipper_id: KlipperId,
    /// A comma separated list of pins associated with this alias. This
    /// parameter must be provided.
    pub pins: f64,
}
