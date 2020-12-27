use serde::{Serialize, Deserialize};
use schemars::JsonSchema;

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

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CorePluginConfig {
  /// # Printer Name
  // TODO: validate: #[schemars(min_length = 1)]
  pub name: String,


  /// # Automatic Printing
  /// Start prints automatically without human interaction.
  /// Requires automation hardware such as an auto-scraper or
  /// conveyor.
  pub automatic_printing: bool,

  /// # Swap visual orientation of X and Y axes
  pub swap_x_and_y_orientation: bool,

  /// # Before Print (GCode)
  pub before_print_hook: String,

  /// # After Print (GCode)
  pub after_print_hook: String,

  /// # After Pause (GCode)
  pub pause_hook: String,

  /// # Before Resume (GCode)
  pub resume_hook: String,

  // pub macros: Vec<String>,
}
