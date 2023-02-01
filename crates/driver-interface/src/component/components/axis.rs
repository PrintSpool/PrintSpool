use nanoid::nanoid;
use regex::Regex;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use super::ComponentInner;

#[derive(
    async_graphql::SimpleObject, Debug, Serialize, Deserialize, Collection, Clone, SmartDefault,
)]
[collection(name = "axis", views = [], natural_id = |entry: AxisEphemeral| entry.id)]
pub struct AxisEphemeral {
    #[default(nanoid!(11).into())]
    pub id: async_graphql::ID,

    /// The target position in mm.
    pub target_position: Option<f32>,
    /// The current position in mm.
    pub actual_position: Option<f32>,
    pub homed: bool,
}

pub type Axis = ComponentInner<AxisConfig, AxisEphemeral>;
