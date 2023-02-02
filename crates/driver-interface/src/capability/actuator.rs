use nanoid::nanoid;
use regex::Regex;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::DbId;

use super::ComponentInner;

pub struct Actuator {
    /// visual orientation of the axis of Actuator with respect to the other axes of Actuator within this component.
    pub axis: AxisOrientation,
    pub alias: GCodeAlias,
    pub can_home_start: bool,
    pub can_home_end: bool,
}

pub enum AxisOrientation {
    LinearX,
    LinearY,
    LinearZ,
    // RotationX,
    // RotationY,
    // RotationZ,
    // NonCartesian(String),
}

#[derive(
    async_graphql::SimpleObject, Debug, Serialize, Deserialize, Collection, Clone, SmartDefault,
)]
#[collection(name = "actuator_state", views = [], natural_id = |entry: ActuatorState| entry.id)]
pub struct ActuatorState {
    pub id: DbId<Self>,

    /// The target position in mm.
    pub target_position: Option<f32>,
    /// The current position in mm.
    pub actual_position: Option<f32>,
    pub homed: bool,
}
