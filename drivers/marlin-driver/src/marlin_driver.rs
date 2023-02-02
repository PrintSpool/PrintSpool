use crate::{
    marlin_machine::{MarlinMachine, MarlinMachineTemplate},
    MarlinDriverInstance,
};
use async_trait::async_trait;
use bonsaidb::core::transaction::Transaction;
use chrono::Utc;
use printspool_driver_interface::{
    component::ComponentTypeDescriptor,
    driver::{Driver, MachineLayout},
    driver_instance::LocalDriverInstance,
    DB,
};

#[derive(Clone, Copy)]
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

    fn component_types(&self) -> Vec<ComponentTypeDescriptor> {
        vec![
            Axis::type_descriptor(),
            BuildPlatform::type_descriptor(),
            Fan::type_descriptor(),
            Extruder::type_descriptor(),
        ]
    }

    fn component_from_value(
        &self,
        value: serde_json::Value,
    ) -> Result<Box<dyn DriverComponent>, serde_json::Error> {
        Ok(Box::new(serde_json::from_value::<MarlinComponent>(value)?))
    }

    // Necessary for Object Safety (schemars::JsonSchema is not object safe but schemars::Schema is)
    fn component_schema(
        &self,
        gen: &mut schemars::gen::SchemaGenerator,
    ) -> schemars::schema::Schema {
        MarlinComponent::json_schema(gen)
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

    pub async fn reset_material_targets(
        &self,
        db: &Db,
        material_filter: Option<&Material>,
    ) -> Result<()> {
        let db = self.db.clone();
        let data = self.get_data()?;

        let extruders = ComponentsByType::entries(&self.db)
            .with_key((self.id, Extruder::type_descriptor().name))
            .query_with_collection_docs()
            .await?;

        let material_id = material.map(|material| match material.config {
            MaterialConfigEnum::FdmFilament(filament) => &filament.id,
        });

        // Reset the material targets on all extruders
        for m in extruders {
            let mut component = extruder.document.contents;
            let Some(extruder) = component.driver_config.downcast_ref::<Extruder>() else {
                return Err(erye!("Expected an extruder, got: {:?}", component.driver_config));
            };

            // if material_id_filter reset all targets, if a material id is specified then only reset targets for that material
            // (as it has presumably been changed)
            if material_filter.is_none() || Some(extruder.material_id) == material_id {
                self.set_material(db, &mut component, material).await?;
            }
        }

        Ok(())
    }

    pub async fn set_material(
        &self,
        db: &Db,
        extruder: &mut Component,
        material: Option<&Material>,
    ) -> Result<()> {
        let Some(extruder) = extruder.driver_config.downcast_ref::<Extruder>() else {
            return Err(eyre!("On Marlin printers, materials can only be set for extruders"));
        };

        extruder.material_id = material.map(|material| match material.config {
            MaterialConfigEnum::FdmFilament(filament) => filament.id,
        });

        component.update_async().await?;
    }
}
