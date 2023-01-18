use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct PauseResume {
    /// When capture/restore is enabled, the speed at which to return to
    /// the captured position (in mm/s). Default is 50.0 mm/s.
    pub recover_velocity: Option<f64>,
}
