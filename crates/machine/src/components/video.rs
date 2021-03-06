use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use validator::Validate;

use super::ComponentInner;

/// # Video
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct VideoConfig {
    /// # Name
    #[validate(length(min = 1))]
    pub name: String,

    /// # Source
    #[validate(length(min = 1))]
    pub source: String,
}

pub type Video = ComponentInner<VideoConfig, ()>;
