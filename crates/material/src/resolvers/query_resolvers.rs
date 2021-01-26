// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };
use async_graphql::{
    // ID,
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
    async fn materials<'ctx>(&self, ctx: &'ctx Context<'_>,) -> FieldResult<Vec<Material>> {
        let db: &crate::Db = ctx.data()?;

        let materials = Material::get_all(db).await?;

        Ok(materials)
    }
}
