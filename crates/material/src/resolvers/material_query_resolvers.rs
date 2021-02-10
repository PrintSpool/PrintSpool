// use eyre::{
//     // eyre,
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

#[derive(async_graphql::InputObject, Default)]
pub struct MaterialsInput {
    #[graphql(name = "materialID")]
    material_id: Option<ID>,
}

#[derive(Default)]
pub struct MaterialQuery;

#[async_graphql::Object]
impl MaterialQuery {
    async fn materials<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(default)]
        input: MaterialsInput,

    ) -> FieldResult<Vec<Material>> {
        let db: &crate::Db = ctx.data()?;

        let materials = if let Some(id) = input.material_id {
            let material = Material::get(db, &id).await?;

            vec![material]
        } else {
            Material::get_all(db).await?
        };

        Ok(materials)
    }
}
