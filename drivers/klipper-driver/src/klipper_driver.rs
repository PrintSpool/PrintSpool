use crate::{
    klipper_machine::{KlipperMachine, KlipperMachineTemplate},
    KlipperDriverInstance,
};
use async_trait::async_trait;
use bonsaidb::core::transaction::Transaction;
use chrono::Utc;
use printspool_driver_interface::{
    driver::{Driver, MachineLayout},
    driver_instance::LocalDriverInstance,
    DB,
};

pub struct KlipperDriver;

#[async_trait]
impl Driver for KlipperDriver {
    fn name(&self) -> &'static str {
        "klippper"
    }

    fn import_file_extensions(&self) -> Vec<String> {
        vec![]
    }

    fn component_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverComponent>, serde_json::Error> {
        Ok(Box::new(serde_json::from_value::<KlipperComponent>(value)?))
    }

    // Necessary for Object Safety (schemars::JsonSchema is not object safe but schemars::Schema is)
    fn machine_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema {
        KlipperMachine::json_schema(gen)
    }

    async fn create_machine_layout(
        &self,
        machine_config: serde_json::Value,
    ) -> Result<MachineLayout> {
        let id = rand::random();

        let machine: KlipperMachine = serde_json::from_value(machine_config)?;

        let components = vec![];

        if let KlipperMachineTemplate::BuiltIn(template_name) = config.template {
            todo!("Built in templates for Klipper are not yet implemented");
            // TODO: This should create all the components
            // return self.import_machine(...)
        };

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
        todo!("import for Klipper is not yet implemented");

        Ok(MachineLayout {
            machine: todo!(),
            components: todo!(),
        })
    }

    async fn load_instance(&self, id: DbId, db: DB) -> Result<Box<dyn LocalDriverInstance>> {
        let driver_instance = KlipperDriverInstance::start(id, db).await?;
    }

    // Necessary for Object Safety (schemars::JsonSchema is not object safe but schemars::Schema is)
    fn component_schema(
        &self,
        gen: &mut schemars::gen::SchemaGenerator,
    ) -> schemars::schema::Schema {
        KlipperComponent::json_schema(gen)
    }
}
