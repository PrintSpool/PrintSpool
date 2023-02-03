use printspool_proc_macros::define_component;
use regex::Regex;

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
