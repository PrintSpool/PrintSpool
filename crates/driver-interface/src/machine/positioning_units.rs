#[derive(Debug, Clone)]
pub enum PositioningUnits {
    Millimeters,
    Inches,
}

impl Default for PositioningUnits {
    fn default() -> Self {
        PositioningUnits::Millimeters
    }
}
