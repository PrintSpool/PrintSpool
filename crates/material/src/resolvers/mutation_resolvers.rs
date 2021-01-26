use chrono::prelude::*;
use async_graphql::{
    FieldResult,
    ID,
    Context,
};
use anyhow::{
    Context as _,
    // anyhow,
    // Result
};
// use teg_json_store::Record as _;

use teg_auth::AuthContext;
use teg_json_store::Record;
use crate::material::{
    Material,
    MaterialConfigEnum,
};

// Input Types
// ---------------------------------------------

#[derive(async_graphql::InputObject)]
pub struct CreateMaterialInput {
    pub model: async_graphql::Json<MaterialConfigEnum>,
}

#[derive(async_graphql::InputObject)]
pub struct UpdateMaterial {
    #[graphql(name="materialID")]
    pub material_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<MaterialConfigEnum>,
}

#[derive(async_graphql::InputObject)]
pub struct DeleteMaterial {
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

        let material = Material {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            config: input.model.0,
        };

        material.insert(db).await?;

        Ok(material)
    }

    async fn update_material<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: UpdateMaterial,
    ) -> FieldResult<Material> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let mut material = Material::get_with_version(
            db,
            &input.material_id,
            input.model_version,
        ).await?;

        material.config = input.model.0;

        material.update(db).await?;

        Ok(material)
    }

    async fn delete_material<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: DeleteMaterial
    ) -> FieldResult<Option<bool>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let DeleteMaterial { material_id } = input;
        let material_id = material_id.to_string();

        Material::remove(db, &material_id)
            .await
            .with_context(|| "Error deleting material")?;

        Ok(None)
    }
}
