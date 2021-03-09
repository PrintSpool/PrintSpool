use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use validator::Validate;
use regex::Regex;

use super::ComponentInner;
use super::HeaterEphemeral;

lazy_static! {
    static ref BUILD_PLATFORM_ADDRESS: Regex = Regex::new(r"^b$").unwrap();
}

/// # Build Platform
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct BuildPlatformConfig {
    /// # Name
    #[validate(length(min = 1))]
    pub name: String,

    /// # GCode Address
    #[validate(regex(path = "BUILD_PLATFORM_ADDRESS", message = r#"
        Bed address must be 'b'
    "#))]
    pub address: String,

    /// # Heated Build Platform
    #[serde(default)]
    pub heater: bool,
}

impl teg_config_form::Model for BuildPlatformConfig {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}

pub type BuildPlatform = ComponentInner<BuildPlatformConfig, HeaterEphemeral>;
