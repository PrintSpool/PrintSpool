use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
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
