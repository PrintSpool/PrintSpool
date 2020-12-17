use serde::{Deserialize, Serialize};

use super::ComponentInner;
use super::HeaterEphemeral;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BuildPlatformConfig {
    pub address: String,
    pub heater: bool,
}

pub type BuildPlatform = ComponentInner<BuildPlatformConfig, HeaterEphemeral>;
