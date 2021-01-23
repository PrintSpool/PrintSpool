use serde::{Deserialize, Serialize};
use nanoid::nanoid;
use schemars::JsonSchema;

use super::ComponentInner;

/// # Fan
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SpeedControllerConfig {
    /// # Name
    // TODO: validate: #[schemars(min_length = 1)]
    pub name: String,

    /// # GCode Address
    // TODO: validate: #[schemars(min_length = 1)]
    pub address: String,
}

#[derive(async_graphql::SimpleObject, Debug, Clone, SmartDefault)]
pub struct SpeedControllerEphemeral {
    #[default(nanoid!(11).into())]
    pub id: async_graphql::ID,
    /// The expected speed of the SpeedController when it is enabled (in RPM).
    pub target_speed: Option<f32>,
    /// The current speed of the SpeedController in RPM.
    pub actual_speed: Option<f32>,
    /// True if the SpeedController is on.
    pub enabled: bool,
}

pub type SpeedController = ComponentInner<SpeedControllerConfig, SpeedControllerEphemeral>;
