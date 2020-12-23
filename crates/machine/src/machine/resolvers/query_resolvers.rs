use std::sync::Arc;
use std::collections::HashMap;
use futures::future::join_all;
// use chrono::prelude::*;
use async_graphql::{
    ID,
    FieldResult,
    Context,
};
use xactor::Addr;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::machine::messages::GetData;

use crate::machine::{
    Machine,
    MachineData,
    // Task,
    // TaskStatus,
};

#[derive(Default)]
pub struct MachineQuery;

#[async_graphql::Object]
impl MachineQuery {
    #[instrument(skip(self, ctx))]
    async fn machines<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: Option<ID>,
    ) -> FieldResult<Vec<MachineData>> {
        let machines: &Arc<HashMap<ID, Addr<Machine>>> = ctx.data()?;

        let machines: Vec<&Addr<Machine>> = if let Some(id) = id {
            let addr = machines.get(&id)
                .ok_or_else(|| anyhow!("No machine found ({:?})", id))?;

            vec![addr]
        } else {
            machines.values().collect()
        };

        let machines = machines
            .into_iter()
            .map(|addr| addr.call(GetData()));

        let machines = join_all(machines).await
            .into_iter()
            .collect::<Result<Vec<_>>>()?;

        Ok(machines)
    }
}
