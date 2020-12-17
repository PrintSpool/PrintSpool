use serde::{Deserialize, Serialize};

use super::ComponentInner;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AxisConfig {
    pub address: String,
    pub name: String,
    pub feedrate: f32,
    #[serde(default)]
    pub reverse_direction: bool,
}

#[derive(Default, Debug, Clone)]
pub struct AxisEphemeral {
    pub target_position: Option<f32>,
    pub actual_position: Option<f32>,
    pub homed: bool,
}

pub type Axis = ComponentInner<AxisConfig, AxisEphemeral>;
