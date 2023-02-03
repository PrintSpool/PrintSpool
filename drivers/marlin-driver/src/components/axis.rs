use super::ComponentInner;
use nanoid::nanoid;
use printspool_driver_interface::component::ComponentTypeDescriptor;
use printspool_proc_macros::define_component;
use regex::Regex;

lazy_static! {
    static ref AXIS_ADDRESS: Regex = Regex::new(r"^[a-z]$").unwrap();
}

/// # Axis

#[define_component]
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

impl Axis {
    pub fn type_descriptor() -> ComponentTypeDescriptor {
        ComponentTypeDescriptor {
            name: "MARLIN_AXIS",
            display_name: "axis",
            fixed_list: true,
        }
    }
}

impl printspool_config_form::Model for Axis {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
