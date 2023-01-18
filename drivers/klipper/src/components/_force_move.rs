use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct ForceMove {
    /// Set to true to enable FORCE_MOVE and SET_KINEMATIC_POSITION
    /// extended G-Code commands. The default is false.
    pub enable_force_move: Option<f64>,
}
