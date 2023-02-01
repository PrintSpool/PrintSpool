use nanoid::nanoid;
use regex::Regex;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use super::ComponentInner;

#[derive(async_graphql::SimpleObject, Debug, Clone, SmartDefault)]
pub struct FanEphemeral {
    #[default(nanoid!(11).into())]
    pub id: async_graphql::ID,
    /// The expected speed of the fan when it is enabled as a 0-100% percentage of it's
    /// max speed.
    pub target_speed: Option<f32>,
    /// The current speed of the fan as a 0-100% percentage of it's max speed.
    pub actual_speed: Option<f32>,
    /// True if the SpeedController is on.
    pub enabled: bool,
}

pub type SpeedController = ComponentInner<SpeedControllerConfig, FanEphemeral>;
