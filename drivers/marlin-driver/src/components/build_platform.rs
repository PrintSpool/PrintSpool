use super::HeaterEphemeral;
use printspool_proc_macros::define_component;
use regex::Regex;

lazy_static! {
    static ref BUILD_PLATFORM_ADDRESS: Regex = Regex::new(r"^b$").unwrap();
}

/// # Build Platform
#[define_component(fixed_list = true)]
pub struct BuildPlatform {
    /// # Name
    #[validate(length(min = 1))]
    pub name: String,

    /// # GCode Address
    #[validate(regex(
        path = "BUILD_PLATFORM_ADDRESS",
        message = r#"
        Bed address must be 'b'
    "#
    ))]
    pub address: String,

    /// # Heated Build Platform
    #[serde(default)]
    pub heater: bool,
}
