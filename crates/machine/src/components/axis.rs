use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use nanoid::nanoid;
use validator::Validate;
use regex::Regex;

use super::ComponentInner;

lazy_static! {
    static ref AXIS_ADDRESS: Regex = Regex::new(r"^[a-z]$").unwrap();
}

/// # Axis
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AxisConfig {
    /// # Name
    #[validate(length(min = 1))]
    pub name: String,

    /// # GCode Address
    // #[validate(regex(
    //     path = "AXIS_ADDRESS",
    //     message = "Axis address must be a single letter (eg. 'x', 'y', or 'z')"
    // ))]
    #[validate(regex(path = "AXIS_ADDRESS", message = r#"\
        Axis address must be a single letter (eg. 'x', 'y', or 'z')
    "#))]
    pub address: String,

    /// # Feedrate (mm/s)
    #[validate(range(min = 0))]
    pub feedrate: f32,

    /// # Reverse direction for move buttons and macros
    #[serde(default)]
    pub reverse_direction: bool,
}

#[derive(async_graphql::SimpleObject, Debug, Clone, SmartDefault)]
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
