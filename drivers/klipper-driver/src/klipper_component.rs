use crate::{
    components::{printer::Printer, stepper::GenericStepper},
    fan::{ControllerFan, Fan, FanGeneric, HeaterFan, TemperatureFan},
    KlipperDriver,
};
use printspool_driver_interface::{
    capability::{GCodeAlias, C},
    driver::Driver,
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
    fn driver(&self) -> &'static dyn Driver {
        &KlipperDriver
    }

    fn capabilities(&self) -> Vec<printspool_driver_interface::capability::Capability> {
        match self {
            Self::Fan(c) => vec![C::Fan(GCodeAlias {
                name: "Fan".into(),
                address: "0".into(),
            })],
            // Self::ControllerFan(c) => vec![C::Fan(GCodeAlias {
            //     name: "Controller Fan".into(),
            //     // address: "0".into(),
            // })],
            // Self::FanGeneric(c) => c.validate(),
            // Self::HeaterFan(c) => c.validate(),
            // Self::TemperatureFan(c) => c.validate(),
            // Self::Printer(c) => c.validate(),
            // Self::Stepper(c) => c.validate(),
            _ => todo!(),
        }
    }
}
