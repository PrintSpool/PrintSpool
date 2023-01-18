use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct SaveVariables {
    /// Required - provide a filename that would be used to save the
    /// variables to disk e.g. ~/variables.cfg
    pub filename: f64,
}
