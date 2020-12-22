use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

use super::ComponentInner;

/// # Video
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoConfig {
    /// # Name
    // TODO: validate: #[schemars(min_length = 1)]
    pub name: String,

    /// # Source
    // TODO: validate: #[schemars(min_length = 1)]
    pub source: String,
}

pub type Video = ComponentInner<VideoConfig, ()>;
