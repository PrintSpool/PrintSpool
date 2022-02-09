use async_graphql::{
    // ID,
    FieldResult,
    Context,
};
use eyre::{
    eyre,
    // Result,
    // Context as _,
};
use messages::set_materials::SetMaterialsInput;
// use printspool_auth::{
//     AuthContext,
// };
// use printspool_json_store::Record as _;

use crate::{
    machine::messages,
};

#[derive(Default)]
pub struct ConfigMutation;

#[async_graphql::Object]
impl ConfigMutation {
    #[instrument(skip(self, ctx))]
    async fn set_materials<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: SetMaterialsInput,
    ) -> FieldResult<Option<printspool_common::Void>> {
        // use cgt::ConfigCollection::*;
        // let db: &crate::Db = ctx.data()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine_id = input.machine_id;
        let machine = machines.get(&machine_id)
            .ok_or_else(|| eyre!("Machine ({:?}) not found", &machine_id))?;

        let msg = messages::set_materials::SetMaterial(input.toolheads);
        machine.call(msg).await??;

        Ok(None)
    }
}
