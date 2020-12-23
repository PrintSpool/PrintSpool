use async_graphql::{
    Context,
    FieldResult,
    ID,
};
// use teg_material::Material;

use super::Toolhead;

#[async_graphql::Object]
impl Toolhead {
    async fn id(&self) -> ID {
        self.id.into()
    }

    // TODO: Move materials to their own crate
    async fn currentMaterial<'ctx>(&self, ctx: &'ctx Context<'_>,) -> FieldResult<Option<Material>> {
        let db: &crate::Db = ctx.data()?;

        let material = if let Some(material_id) = self.model.material_id {
            // TODO: Query the material sqlx table
            Material::get(material_id).await?;
            let material = sqlx::query_as!(
                Material,
                "SELECT * FROM materials WHERE id = ?",
                material_id
            )
                .fetch_one(db)
                .await?;

            Some(material)
        } else {
            None
        };

        Ok(material)
    }
}
