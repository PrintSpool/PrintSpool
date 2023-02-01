use nanoid::nanoid;
use regex::Regex;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use super::ComponentInner;

lazy_static! {
    static ref AXIS_ADDRESS: Regex = Regex::new(r"^[a-z]$").unwrap();
}

/// # Axis
#[derive(Serialize, Deserialize, JsonSchema, Validate, Default, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Axis {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # GCode Address
    // #[validate(regex(
    //     path = "AXIS_ADDRESS",
    //     message = "Axis address must be a single letter (eg. 'x', 'y', or 'z')"
    // ))]
    #[validate(regex(
        path = "AXIS_ADDRESS",
        message = r#"
        Axis address must be a single letter (eg. 'x', 'y', or 'z')
    "#
    ))]
    pub address: String,

    /// # Feedrate (mm/s)
    #[validate(range(min = 0, message = "Feedrate must be greater then or equal to 0"))]
    pub feedrate: f32,

    /// # Reverse direction for move buttons and macros
    #[serde(default)]
    pub reverse_direction: bool,
}

impl printspool_config_form::Model for Axis {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
