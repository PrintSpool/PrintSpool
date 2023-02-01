use crate::{
    marlin_machine::{MarlinMachine, MarlinMachineTemplate},
    MarlinDriverInstance,
};
use async_trait::async_trait;
use bonsaidb::core::transaction::Transaction;
use chrono::Utc;
use printspool_driver_interface::{
    driver::{Driver, MachineLayout},
    driver_instance::LocalDriverInstance,
    DB,
};

pub struct MarlinDriver;

#[async_trait]
impl Driver for MarlinDriver {
    fn name(&self) -> &'static str {
        "marlin"
    }

    fn display_name(&self) -> &'static str {
        "Marlin"
    }

    fn import_file_extensions(&self) -> Vec<String> {
        vec![]
    }

    fn fixed_list_component_types(&self) -> Vec<String> {
        vec![
            "CONTROLLER".into(),
            "AXIS".into(),
            "BUILD_PLATFORM".into(),
            "TOOLHEAD".into(),
        ]
    }

    fn component_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverComponent>, serde_json::Error> {
        Ok(Box::new(serde_json::from_value::<MarlinComponent>(value)?))
    }

    // Necessary for Object Safety (schemars::JsonSchema is not object safe but schemars::Schema is)
    fn machine_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        MarlinMachine::json_schema(gen)
    }

    async fn create_machine(&self, machine_config: serde_json::Value) -> Result<MachineLayout> {
        let id = rand::random();

        let machine: MarlinMachine = serde_json::from_value(machine_config)?;

        let components = vec![];

        Ok(MachineLayout {
            machine: Box::new(machine),
            components,
        })
    }

    async fn import_machine_layout(
        &self,
        filename: String,
        content: String,
    ) -> Result<MachineLayout> {
        Err(eyre!("Marlin driver does not implement import"));
    }

    async fn load_instance(
        &self,
        machine_id: DbId,
        db: &DB,
    ) -> Result<Pin<Box<dyn LocalDriverInstance>>> {
        let driver_instance = MarlinDriverInstance::start(id, db.clone()).await?;
        Ok(Pin::new(Box::new(driver_instance)))
    }

    // Necessary for Object Safety (schemars::JsonSchema is not object safe but schemars::Schema is)
    fn component_schema(
        &self,
        gen: &mut schemars::gen::SchemaGenerator,
    ) -> schemars::schema::Schema {
        MarlinComponent::json_schema(gen)
    }
}
