use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use super::ComponentInner;

/// # Video
#[derive(Serialize, Deserialize, JsonSchema, Validate, Default, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CameraConfig {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # Source
    #[validate(length(min = 1, message = "Source cannot be blank"))]
    pub source: String,
}

impl printspool_config_form::Model for CameraConfig {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
