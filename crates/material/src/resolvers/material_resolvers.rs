// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };
use async_graphql::{
    ID,
    // Context,
    FieldResult,
};
use teg_config_form::ConfigForm;

use crate::{
    Material,
    MaterialConfigEnum,
};

#[async_graphql::Object]
impl Material {
    async fn id(&self) -> ID {
        (&self.id).into()
    }

    async fn r#type(&self) -> String {
        match &self.config {
            MaterialConfigEnum::FdmFilament(_) => "FDM_FILAMENT".to_string()
        }
    }

    async fn name(&self) -> &String {
        match &self.config {
            MaterialConfigEnum::FdmFilament(fdm) => {
                &fdm.name
            }
        }
    }

    async fn short_summary(&self) -> String {
        match &self.config {
            MaterialConfigEnum::FdmFilament(fdm) => {
                format!("{}°", fdm.target_extruder_temperature)
            }
        }
    }

    async fn config_form(&self) -> FieldResult<ConfigForm> {
        let config_form = teg_config_form::into_config_form(self)?;
        Ok(config_form)
    }
}
