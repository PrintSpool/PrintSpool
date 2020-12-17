use serde::{Deserialize, Serialize};

use super::ComponentInner;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SpeedControllerConfig {
    pub address: String,
    pub name: String,
}

#[derive(Default, Debug, Clone)]
pub struct SpeedControllerEphemeral {
    pub target_speed: Option<f32>,
    pub actual_speed: Option<f32>,
    pub enabled: bool,
}

pub type SpeedController = ComponentInner<SpeedControllerConfig, SpeedControllerEphemeral>;
