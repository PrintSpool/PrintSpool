use super::{FdmFilament, Material, MaterialConfigEnum};

impl printspool_config_form::Configurable<Box<FdmFilament>> for Material {
    fn id(&self) -> async_graphql::ID {
        format!("material-{}", self.id).into()
    }

    fn model(&self) -> &Box<FdmFilament> {
        match &self.config {
            MaterialConfigEnum::FdmFilament(m) => &m,
        }
    }

    fn model_version(&self) -> i32 {
        self.version
    }
}

impl printspool_config_form::Model for Box<FdmFilament> {
    fn form(_: &Vec<String>) -> Vec<String> {
        vec!["name", "targetExtruderTemperature", "targetBedTemperature"]
            .into_iter()
            .map(Into::into)
            .collect()
    }
}
