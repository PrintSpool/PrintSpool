use async_graphql::{
    ID,
    FieldResult,
    Context,
};
use anyhow::{
    anyhow,
    // Result,
    // Context as _,
};

use crate::machine::messages;

#[derive(Default)]
pub struct MachineMutation;

#[async_graphql::Object]
impl MachineMutation {
    #[instrument(skip(self, ctx))]
    async fn e_stop<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: ID,
    ) -> FieldResult<Option<bool>> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&id)
            .ok_or_else(|| anyhow!("Machine #{:?} not found", id))?;

        machine.call(messages::StopMachine()).await?;

        Ok(None)
    }

    #[instrument(skip(self, ctx))]
    async fn reset<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: ID,
    ) -> FieldResult<Option<bool>> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&id)
            .ok_or_else(|| anyhow!("Machine #{:?} not found", id))?;

        machine.call(messages::ResetMachine()).await?;

        Ok(None)
    }

}
