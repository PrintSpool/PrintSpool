use crate::KlipperId;
use printspool_proc_macros::define_component;
#[define_component]
pub struct DisplayData {
    pub klipper_id: KlipperId,
    /// Comma separated row and column of the display position that should
    /// be used to display the information. This parameter must be
    /// provided.
    pub position: f64,
    /// The text to show at the given position. This field is evaluated
    /// using command templates (see docs/Command_Templates.md). This
    /// parameter must be provided.
    pub text: f64,
}
