use crate::{
    components::{printer::Printer, stepper::GenericStepper},
    fan::{ControllerFan, Fan, HeaterFan, TemperatureFan},
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Linear Delta Kinematics
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum KlipperComponent {
    // <fans>
    Fan(Fan),
    ControllerFan(ControllerFan),
    HeaterFan(HeaterFan),
    TemperatureFan(TemperatureFan),
    // </fans>
    Printer(Printer),
    Stepper(GenericStepper),
}
