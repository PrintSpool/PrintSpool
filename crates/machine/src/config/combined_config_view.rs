use serde::{Serialize, Deserialize};
use schemars::JsonSchema;
use validator::Validate;

use crate::components::BaudRate;

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

/// Top-level printer configuration (Settings -> 3D Printer)
#[derive(Serialize, Deserialize, JsonSchema, Validate, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CombinedConfigView {
    // Core Plugin
    // ----------------------------------

    /// # Printer Name
    #[validate(length(min = 1))]
    pub name: String,

    /// # Automatic Printing
    /// Start prints automatically without human interaction.
    /// Requires automation hardware such as an auto-scraper or
    /// conveyor.
    #[serde(default)]
    pub automatic_printing: bool,

    // Controller Component
    // ----------------------------------

    /// # Serial Port
    #[validate(length(min = 1))]
    #[serde(rename = "serialPortID")]
    pub serial_port_id: String,

    /// # Automatic Baud Rate Detection
    #[serde(default)]
    pub automatic_baud_rate_detection: bool,
    /// # Baud Rate
    pub baud_rate: BaudRate,

    // Build Platform Component
    // ----------------------------------

    /// # Heated Build Platform
    #[serde(default)]
    pub heated_build_platform: bool,
}

impl teg_config_form::Model for CombinedConfigView {
    fn form(all_fields: &Vec<String>) -> Vec<String> {
        all_fields.clone()
    }
}
