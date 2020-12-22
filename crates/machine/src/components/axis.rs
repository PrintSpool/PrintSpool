use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use nanoid::nanoid;

use super::ComponentInner;

/// # Axis
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AxisConfig {
    /// # Name
    // TODO: validate: #[schemars(min_length = 1)]
    pub name: String,

    /// # GCode Address
    // TODO: validate: #[schemars(min_length = 1)]
    pub address: String,

    /// # Feedrate (mm/s)
    // TODO: validate: #[schemars(min = 0)]
    pub feedrate: f32,

    /// # Reverse direction for move buttons and macros
    #[serde(default)]
    pub reverse_direction: bool,
}

#[derive(async_graphql::SimpleObject, Debug, Clone, SmartDefault)]
pub struct AxisEphemeral {
    #[default(nanoid!().into())]
    pub id: async_graphql::ID,

    /// The target position in mm.
    pub target_position: Option<f32>,
    /// The current position in mm.
    pub actual_position: Option<f32>,
    pub homed: bool,
}

pub type Axis = ComponentInner<AxisConfig, AxisEphemeral>;
