use crate::{FdmFilament, Material, MaterialConfigEnum};

impl teg_config_form::Configurable<Box<FdmFilament>> for Material
{
    fn id(&self) -> async_graphql::ID {
        format!("material-{}", self.id).into()
    }

    fn model(&self) -> &Box<FdmFilament> {
        match &self.config {
            MaterialConfigEnum::FdmFilament(m) => {
                &m
            }
        }
    }

    fn model_version(&self) -> i32 {
        self.version
    }

    fn form(_: &Vec<String>) -> Vec<String> {
        vec![
            "name",
            "targetExtruderTemperature",
            "targetBedTemperature",
        ]
            .into_iter()
            .map(Into::into)
            .collect()
    }
}
