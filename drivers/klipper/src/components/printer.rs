use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use self::{cartesian_printer::CartesianPrinter, delta_printer::DeltaPrinter};

pub mod cartesian_printer;
pub mod delta_printer;
mod printer_baseline;

pub use printer_baseline::PrinterBaselineConfig;

/// The type of printer in use. This option may be one of: cartesian,
/// corexy, corexz, hybrid_corexy, hybrid_corexz, rotary_delta, delta,
/// deltesian, polar, winch, or none. This parameter must be specified.
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(tag = "kinematics", rename_all = "snake_case")]
pub enum Printer {
    Cartesian(CartesianPrinter),
    Delta(DeltaPrinter),
}
