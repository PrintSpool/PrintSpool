use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct DisplayTemplate {
    pub klipper_id: KlipperId,
    /// The text to return when the this template is rendered. This field
    /// is evaluated using command templates (see
    /// docs/Command_Templates.md). This parameter must be provided.
    pub text: f64,
}
