use std::sync::Arc;
// use chrono::prelude::*;
use async_graphql::*;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::models::{
    Machine,
    // Task,
    // TaskStatus,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};

#[derive(Default)]
pub struct MachineQuery;

#[Object]
impl MachineQuery {
    #[instrument(skip(self, ctx))]
    async fn machines<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: Option<ID>,
    ) -> FieldResult<Vec<Machine>> {
        info!("machines");
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let machines = if let Some(id) = id {
            let machine = Machine::find(&ctx.db, |machine| {
                machine.config_id == id
            })?;

            vec![machine]
        } else {
            Machine::scan(&ctx.db).collect::<Result<Vec<Machine>>>()?
        };

        Ok(machines)
    }
}
