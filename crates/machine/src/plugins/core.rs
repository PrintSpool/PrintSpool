use serde::{Serialize, Deserialize};
use schemars::JsonSchema;
use validator::Validate;

// // TODO: Previously these configs were include in the machine config for onboarding:
// impl MachineForm for ControllerConfig {
//     fn machine_form() -> Vec<&'static str> {
//         vec![
//             "name",
//             "automaticPrinting",
//             "beforePrintHook",
//             "afterPrintHook",
//             "swapXAndYOrientation",
//         ]
//     }
// }

#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Default, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CorePluginConfig {
    /// # Printer Name
    #[validate(length(min = 1))]
    pub name: String,

    /// # Automatic Printing
    /// Start prints automatically without human interaction.
    /// Requires automation hardware such as an auto-scraper or
    /// conveyor.
    pub automatic_printing: bool,

    /// # Swap visual orientation of X and Y axes
    pub swap_x_and_y_orientation: bool,

    /// # Infinite Z Printer
    /// Renders GCode layers at a 45 degree angle relative to the build platform and positions
    /// prints at the start of the build conveyor.
    ///
    /// Only needed for infinite Z 3D printers with angled X/Y axes.
    #[serde(default)]
    pub infinite_z: bool,

    /// # Before Print (GCode)
    pub before_print_hook: String,

    /// # After Print (GCode)
    pub after_print_hook: String,

    /// # After Pause (GCode)
    pub pause_hook: String,

    /// # Before Resume (GCode)
    pub resume_hook: String,

    /// # Developer Mode
    /// Show settings & debugging tools intended for developers.
    #[serde(default)]
    pub developer_mode: bool,

    // pub macros: Vec<String>,
}

impl teg_config_form::Model for CorePluginConfig {
    fn static_form() -> Option<Vec<&'static str>> {
        Some(vec![
            "name",
            "automaticPrinting",
            "swapXAndYOrientation",
        ])
    }

    fn static_advanced_form() -> Option<Vec<&'static str>> {
        Some(vec![
            "beforePrintHook",
            "afterPrintHook",
            "pauseHook",
            "resumeHook",
            "developerMode",
        ])
    }
}
