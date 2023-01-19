mod components;
pub use components::*;

mod klipper_component;
pub use klipper_component::KlipperComponent;
use printspool_driver_interface::component::Driver;
use schemars::JsonSchema;
use serde::Deserialize;

// These types are used to document the purpose of configs
pub type KlipperId = String;
pub type KlipperIdList = String;
pub type KlipperPin = String;

pub struct KlipperDriver;

impl Driver for KlipperDriver {
    fn deserialize_component<'de, D>(
        deserializer: D,
    ) -> Result<Box<dyn printspool_driver_interface::component::DriverComponent>, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        KlipperComponent::deserialize(deserializer)
    }

    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        KlipperComponent::json_schema(gen)
    }
}
