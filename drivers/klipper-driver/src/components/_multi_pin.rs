use crate::KlipperId;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct MultiPin {
    pub klipper_id: KlipperId,
    /// A comma separated list of pins associated with this alias. This
    /// parameter must be provided.
    pub pins: f64,
}
