use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PositioningUnits {
    Millimeters,
    Inches,
}

impl Default for PositioningUnits {
    fn default() -> Self {
        PositioningUnits::Millimeters
    }
}
