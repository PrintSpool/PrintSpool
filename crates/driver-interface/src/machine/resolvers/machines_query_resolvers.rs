use futures::future::join_all;
// use chrono::prelude::*;
use async_graphql::{Context, FieldResult, ID};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use xactor::Addr;

use crate::machine::messages::GetData;

use crate::machine::{
    Machine,
    Machine,
    // Task,
    // TaskStatus,
};

#[derive(async_graphql::InputObject, Debug, Default)]
struct MachinesInput {
    /// Optional filter: Return the machine by id
    #[graphql(name = "machineID")]
    machine_id: Option<async_graphql::ID>,
}

#[derive(Default)]
pub struct MachineQuery;

#[async_graphql::Object]
impl MachineQuery {
    #[instrument(skip(self, ctx))]
    async fn is_configured<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: Option<ID>,
    ) -> FieldResult<bool> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        Ok(!machines.is_empty())
    }

    #[instrument(skip(self, ctx))]
    async fn machines<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(default)] input: MachinesInput,
    ) -> FieldResult<Vec<Machine>> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machines: Vec<&Addr<Machine>> = if let Some(id) = input.machine_id {
            let addr = machines
                .get(&id)
                .ok_or_else(|| eyre!("Machine not found ({:?})", id))?;

            vec![addr]
        } else {
            machines.values().collect()
        };

        let machines = machines.into_iter().map(|addr| addr.call(GetData));

        let machines = join_all(machines)
            .await
            .into_iter()
            .collect::<Result<Result<Vec<_>>>>()??;

        Ok(machines)
    }
}
