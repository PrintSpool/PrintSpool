use chrono::prelude::*;
use async_graphql::{
    FieldResult,
    ID,
    Context,
};
use eyre::{
    Context as _,
    // eyre,
    // Result
};
// use printspool_json_store::Record as _;

use printspool_auth::AuthContext;
use printspool_json_store::Record;
use crate::{FdmFilament, MaterialTypeGQL, material::{
        Material,
        MaterialConfigEnum,
    }};

// Input Types
// ---------------------------------------------

#[derive(async_graphql::InputObject, Debug)]
pub struct CreateMaterialInput {
    pub material_type: MaterialTypeGQL,
    pub model: async_graphql::Json<serde_json::Value>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct UpdateMaterialInput {
    #[graphql(name="materialID")]
    pub material_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<serde_json::Value>,
}

#[derive(async_graphql::InputObject)]
pub struct DeleteMaterialInput {
    #[graphql(name="materialID")]
    pub material_id: ID,
}

// Resolvers
// ---------------------------------------------

#[derive(Default)]
pub struct MaterialMutation;

#[async_graphql::Object]
impl MaterialMutation {
    async fn create_material<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: CreateMaterialInput,
    ) -> FieldResult<Material> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let config = match input.material_type {
            MaterialTypeGQL::FdmFilament => {
                let config: FdmFilament = serde_json::from_value(input.model.0)?;
                MaterialConfigEnum::FdmFilament(Box::new(config))
            }
        };

        let material = Material {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            deleted_at: None,
            config,
        };

        material.insert(db).await?;

        Ok(material)
    }

    #[instrument(skip(self, ctx))]
    async fn update_material<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: UpdateMaterialInput,
    ) -> FieldResult<Material> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;
        let material_hooks: &crate::MaterialHooksList = ctx.data()?;

        auth.authorize_admins_only()?;

        async move {
            let mut material = Material::get_with_version(
                db,
                &input.material_id,
                input.model_version,
                false,
            ).await?;

            material.config = match material.config {
                MaterialConfigEnum::FdmFilament(_) => {
                    let config: FdmFilament = serde_json::from_value(input.model.0)?;
                    MaterialConfigEnum::FdmFilament(Box::new(config))
                }
            };

            material.update(db).await?;

            for hooks_provider in material_hooks.iter() {
                hooks_provider.after_update(
                    &material.id
                ).await?;
            }

            Ok(material)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err: eyre::Error| {
            warn!("{:?}", err);
            err.into()
        })
    }

    async fn delete_material<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: DeleteMaterialInput
    ) -> FieldResult<Option<printspool_common::Void>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let DeleteMaterialInput { material_id } = input;

        Material::get(db, &material_id.0, true)
            .await?
            .remove(db, false)
            .await
            .wrap_err_with(|| "Error deleting material")?;

        Ok(None)
    }
}
