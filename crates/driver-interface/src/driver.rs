use crate::component::DriverComponent;
use once_cell::sync::OnceCell;
use std::collections::HashMap;

pub trait Driver: Sync + Send {
    fn name(&self) -> &'static str;

    /// Deserialize a component defined in this driver from a json value
    fn component_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverComponent>, serde_json::Error>;

    /// Gets the JSON Schema for the component types defined in the driver
    fn json_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema;
}

pub static DRIVER_REGISTRY: OnceCell<HashMap<String, &'static dyn Driver>> = OnceCell::new();
