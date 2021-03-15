use async_graphql::{
    Context,
    FieldResult,
    ID,
};
use teg_material::Material;
use teg_json_store::Record as _;

use super::Toolhead;

#[async_graphql::Object]
impl Toolhead {
    async fn id(&self) -> ID {
        (&self.id).into()
    }

    async fn current_material<'ctx>(&self, ctx: &'ctx Context<'_>,) -> FieldResult<Option<Material>> {
        let db: &crate::Db = ctx.data()?;

        let material_id = self.model.material_id.as_ref();
        let material = if let Some(material_id) = material_id {
            let material = Material::get(db, material_id, true).await?;

            Some(material)
        } else {
            None
        };

        Ok(material)
    }
}
