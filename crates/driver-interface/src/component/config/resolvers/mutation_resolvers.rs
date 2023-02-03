use async_graphql::{
    futures_util::future::{try_join, try_join_all},
    Context,
    // ID,
    FieldResult,
    ID,
};
use eyre::eyre;

use crate::{component::Component, material::Material, Db, Deletion, DriverMapInstance};
// use printspool_auth::{
//     AuthContext,
// };

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsInput {
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    pub components: Vec<SetMaterialsComponent>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsComponent {
    pub id: ID,
    #[graphql(name = "materialID")]
    pub material_id: Option<ID>,
}

#[derive(Default)]
pub struct ConfigMutation;

#[async_graphql::Object]
impl ConfigMutation {
    #[instrument(skip(self, ctx))]
    async fn set_materials(
        &self,
        ctx: &Context<'_>,
        input: SetMaterialsInput,
    ) -> FieldResult<Option<printspool_common::Void>> {
        let driver_instances: &DriverMapInstance = ctx.data()?;

        let driver_inst = driver_instances
            .get(input.machine_id.into())
            .ok_or_else(|| eyre!("Machine ({:?}) not found", &input.machine_id))?;

        try_join_all(input.components.map(|c| async move {
            let (component, material) = try_join(
                Component::load_by_id(Deletion::None, c.id.into(), ctx),
                Material::load_by_id(Deletion::None, c.material_id, ctx),
            )
            .await?;

            driver_inst
                .driver()
                .set_material(component, material)
                .await?;

            Ok(())
        }))
        .await?;

        Ok(None)
    }
}
