// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use teg_json_store::Record as _;

use crate::{
    Material,
};

#[derive(Default)]
pub struct MaterialQuery;

#[async_graphql::Object]
impl MaterialQuery {
    async fn materials<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(name = "materialID")]
        material_id: Option<ID>,
    ) -> FieldResult<Vec<Material>> {
        let db: &crate::Db = ctx.data()?;

        let materials = if let Some(id) = material_id {
            let material = Material::get(db, &id).await?;

            vec![material]
        } else {
            Material::get_all(db).await?
        };

        Ok(materials)
    }
}
