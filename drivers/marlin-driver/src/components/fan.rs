use super::ComponentInner;
use nanoid::nanoid;
use printspool_proc_macros::define_component;
use regex::Regex;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

lazy_static! {
    static ref FAN_ADDRESS: Regex = Regex::new(r"^f\d+$").unwrap();
}

/// # Fan
#[define_component]
pub struct Fan {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # GCode Address
    #[validate(regex(
        path = "FAN_ADDRESS",
        message = r#"
        Fan address must start with the letter 'f' followed by a number
        (eg. f1 or f2)
    "#
    ))]
    pub address: String,
}

impl Axis {
    pub fn type_descriptor() -> ComponentTypeDescriptor {
        ComponentTypeDescriptor {
            name: "MARLIN_FAN",
            display_name: "Fan",
            fixed_list: false,
        }
    }
}

impl printspool_config_form::Model for Fan {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
