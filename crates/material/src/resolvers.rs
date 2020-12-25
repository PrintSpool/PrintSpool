use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use teg_config_form::ConfigForm;

use crate::{
    Material,
    MaterialConfigEnum,
};

pub struct Query();

#[async_graphql::Object]
impl Query {
    async fn materials<'ctx>(&self, ctx: &'ctx Context<'_>,) -> FieldResult<Vec<Material>> {
        let db: &crate::Db = ctx.data()?;

        let materials = Material::get_all(&db).await?;

        Ok(materials)
    }
}

#[async_graphql::Object]
impl Material {
    async fn id(&self) -> ID {
        self.id.into()
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
        let config_form: Result<ConfigForm> = self.into();
        Ok(config_form?)
    }
}
