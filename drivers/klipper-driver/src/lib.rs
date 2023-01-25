mod components;
pub use components::*;

mod klipper_component;
pub use klipper_component::KlipperComponent;
use printspool_driver_interface::{component::DriverComponent, driver::Driver, serde_json};
use schemars::JsonSchema;

// These types are used to document the purpose of configs
pub type KlipperId = String;
pub type KlipperIdList = String;
pub type KlipperPin = String;

pub struct KlipperDriver;

impl Driver for KlipperDriver {
    fn component_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverComponent>, serde_json::Error> {
        Ok(Box::new(serde_json::from_value::<KlipperComponent>(value)?))
    }

    // Necessary for Object Safety (schemars::JsonSchema is not object safe but schemars::Schema is)
    fn json_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        KlipperComponent::json_schema(gen)
    }

    fn name(&self) -> &'static str {
        "klippper"
    }
}
