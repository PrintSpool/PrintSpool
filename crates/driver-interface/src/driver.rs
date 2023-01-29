use crate::{
    component::DriverComponent,
    driver_instance::LocalHostDriverInstance,
    machine::{DriverMachine, MachineLayout},
    DbId,
};
use async_trait::async_trait;
use eyre::Result;
use once_cell::sync::OnceCell;
use std::collections::HashMap;

#[async_trait]
pub trait Driver: Sync + Send {
    fn name(&self) -> &'static str;

    /// Accepted file extensions for importing a machine
    fn import_file_extensions(&self) -> Vec<String>;

    /// Deserialize a component defined in this driver from a json value
    fn component_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverComponent>, serde_json::Error>;

    /// Gets the JSON Schema for the component types defined in the driver
    fn component_json_schema(
        &self,
        gen: &mut schemars::gen::SchemaGenerator,
    ) -> schemars::schema::Schema;

    fn machine_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema;

    // TODO: This method will need a way to be called from other hosts in the printer network (Reuse GraphQL mutation?)
    async fn create_machine_layout(
        &self,
        machine_config: serde_json::Value,
    ) -> Result<MachineLayout>;

    // TODO: This method will need a way to be called from other hosts in the printer network (Reuse GraphQL mutation?)
    async fn import_machine_layout(
        &self,
        filename: String,
        content: String,
    ) -> Result<MachineLayout>;

    async fn load_instance(&self, id: DbId) -> Result<Box<dyn LocalHostDriverInstance>>;
}

pub static DRIVER_REGISTRY: OnceCell<HashMap<String, &'static dyn Driver>> = OnceCell::new();
