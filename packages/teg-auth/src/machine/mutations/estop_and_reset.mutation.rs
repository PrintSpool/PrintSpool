use std::sync::Arc;
use async_graphql::{
    ID,
    Object,
    FieldResult,
};
use eyre::{
    // eyre,
    // Result,
    Context as _,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
    // VersionedModelResult,
};
use crate::machine::models::{
    Machine,
};

#[derive(Default)]
pub struct EStopAndResetMutation;

#[Object]
impl EStopAndResetMutation {
    async fn e_stop<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        #[arg(name="machineID")]
        machine_id: ID,
    ) -> FieldResult<Option<bool>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let machine_id = machine_id.parse::<u64>()
            .with_context(|| format!("Invalid machine id: {:?}", machine_id))?;

        Machine::stop(&ctx.db, machine_id)?;

        Ok(None)
    }

    async fn reset<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        #[arg(name="machineID")]
        machine_id: ID,
    ) -> FieldResult<Option<bool>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let machine_id = machine_id.parse::<u64>()
            .with_context(|| format!("Invalid machine id: {:?}", machine_id))?;

        Machine::get_and_update(&ctx.db, machine_id, |mut machine| {
            machine.reset_counter += 1;

            machine
        })?;

        Ok(None)
    }
}
