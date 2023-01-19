use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct DisplayTemplate {
    pub klipper_id: KlipperId,
    /// The text to return when the this template is rendered. This field
    /// is evaluated using command templates (see
    /// docs/Command_Templates.md). This parameter must be provided.
    pub text: f64,
}
