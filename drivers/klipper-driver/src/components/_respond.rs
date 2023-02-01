use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct Respond {
    /// Sets the default prefix of the "M118" and "RESPOND" output to one
    /// of the following:
    /// echo: "echo: " (This is the default)
    /// command: "// "
    /// error: "!! "
    pub default_type: Option<f64>,
    /// Directly sets the default prefix. If present, this value will
    /// override the "default_type".
    pub default_prefix: Option<f64>,
}