use serde::{Serialize, Deserialize};
use schemars::JsonSchema;

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
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CombinedConfigView {
    // Core Plugin
    // ----------------------------------

    /// # Printer Name
    // TODO: validate: #[schemars(min_length = 1)]
    pub name: String,

    /// # Automatic Printing
    /// Start prints automatically without human interaction.
    /// Requires automation hardware such as an auto-scraper or
    /// conveyor.
    pub automatic_printing: bool,

    // Controller Component
    // ----------------------------------

    /// # Serial Port
    // TODO: validate: #[schemars(min_length = 1)]
    #[serde(rename = "serialPortID")]
    pub serial_port_id: String,

    /// # Automatic Baud Rate Detection
    pub automatic_baud_rate_detection: bool,
    /// # Baud Rate
    pub baud_rate: BaudRate,

    // Build Platform Component
    // ----------------------------------

    /// # Heated Build Platform
    pub heated_build_platform: bool,
}
