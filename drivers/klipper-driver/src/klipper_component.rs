use crate::{
    components::{printer::Printer, stepper::GenericStepper},
    fan::{ControllerFan, Fan, FanGeneric, HeaterFan, TemperatureFan},
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

/// Linear Delta Kinematics
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum KlipperComponent {
    // <fans>
    Fan(Fan),
    ControllerFan(ControllerFan),
    FanGeneric(FanGeneric),
    HeaterFan(HeaterFan),
    TemperatureFan(TemperatureFan),
    // </fans>
    Printer(Printer),
    Stepper(GenericStepper),
}

impl Validate for KlipperComponent {
    fn validate(&self) -> Result<(), validator::ValidationErrors> {
        match self {
            Self::Fan(c) => c.validate(),
            Self::ControllerFan(c) => c.validate(),
            Self::FanGeneric(c) => c.validate(),
            Self::HeaterFan(c) => c.validate(),
            Self::TemperatureFan(c) => c.validate(),
            Self::Printer(c) => c.validate(),
            Self::Stepper(c) => c.validate(),
        }
    }
}

impl printspool_driver_interface::component::DriverComponent for KlipperComponent {
    fn driver_name() -> &'static str {
        "klipper"
    }
}
