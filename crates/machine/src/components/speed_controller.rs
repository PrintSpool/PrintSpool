use serde::{Deserialize, Serialize};
use nanoid::nanoid;
use schemars::JsonSchema;
use validator::Validate;
use regex::Regex;

use super::ComponentInner;

lazy_static! {
    static ref FAN_ADDRESS: Regex = Regex::new(r"^f\d+$").unwrap();
}
/// # Fan
#[derive(Serialize, Deserialize, JsonSchema, Validate, Default, Debug, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct SpeedControllerConfig {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # GCode Address
    #[validate(regex(path = "FAN_ADDRESS", message = r#"
        Fan address must start with the letter 'f' followed by a number
        (eg. f1 or f2)
    "#))]
    pub address: String,
}

impl teg_config_form::Model for SpeedControllerConfig {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
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
