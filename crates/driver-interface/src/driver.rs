use crate::{
    component::{Component, ComponentTypeDescriptor, DriverComponent},
    driver_instance::LocalDriverInstance,
    machine::{DriverMachine, Machine, MachineLayout},
    material::Material,
    Db, DbId,
};
use async_trait::async_trait;
use eyre::Result;
use once_cell::sync::OnceCell;
use std::{collections::HashMap, pin::Pin};

#[async_trait]
pub trait Driver: Sync + Send {
    fn name(&self) -> &'static str;
    fn display_name(&self) -> &'static str;

    /// Accepted file extensions for importing a machine
    fn import_file_extensions(&self) -> Vec<String>;

    fn component_types(&self) -> Vec<ComponentTypeDescriptor>;

    /// Deserialize a component defined in this driver from a json value
    fn component_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverComponent>, serde_json::Error>;

    /// Gets the JSON Schema for the component types defined in the driver
    fn component_schema(
        &self,
        gen: &mut schemars::gen::SchemaGenerator,
    ) -> schemars::schema::Schema;

    fn machine_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema;

    // TODO: This method will need a way to be called from other hosts in the printer network (Reuse GraphQL mutation?)
    async fn create_machine(&self, machine_config: serde_json::Value) -> Result<MachineLayout>;

    // TODO: This method will need a way to be called from other hosts in the printer network (Reuse GraphQL mutation?)
    async fn import_machine_layout(
        &self,
        filename: String,
        content: String,
    ) -> Result<MachineLayout>;

    /// Deserialize the machine type defined by this driver from a json value
    fn machine_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverMachine>, serde_json::Error>;

    /// Starts a driver instance with the given machine ID
    async fn load_instance(
        &self,
        machine_id: DbId<Machine>,
        db: &Db,
    ) -> Result<Pin<Box<dyn LocalDriverInstance>>>;

    /// material_filter optionally filters the reset to only update the components currently using the given material.
    /// Otherwise, if this is None it reset all material target temperatures.
    async fn reset_material_targets(
        &self,
        db: &Db,
        material_filter: Option<&Material>,
    ) -> Result<()>;

    async fn set_material(
        &self,
        db: &Db,
        extruder: &mut Component,
        material: Option<&Material>,
    ) -> Result<()>;
}

pub static DRIVER_REGISTRY: OnceCell<HashMap<String, &'static dyn Driver>> = OnceCell::new();
