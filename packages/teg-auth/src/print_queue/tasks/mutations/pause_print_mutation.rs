use std::sync::Arc;
use futures::prelude::*;
use futures::stream::{StreamExt};
// use std::collections::HashMap;
use async_graphql::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    anyhow,
    Context as _,
};

use crate::models::{
    VersionedModel,
    VersionedModelError,
};
use crate::{
    Machine,
    // MachineStatus,
    print_queue::macros::AnyMacro,
    print_queue::macros::{
        compile_macros,
        AnnotatedGCode,
    },
};
use super::*;

#[derive(Default)]
pub struct PausePrintMutation;

#[Object]
impl PausePrintMutation {
    /// Pauses a print
    async fn pause_print<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[field(name="taskID")]
        task_id: ID,
    ) -> FieldResult<Task> {
        let task_id = task_id.parse::<u64>()
            .with_context(|| format!("Invalid task id: {:?}", task_id))?;

        let ctx: &Arc<crate::Context> = ctx.data()?;
        let config = ctx.machine_config.load();
        let core_plugin = config.core_plugin()?;

        let task = ctx.db.transaction(|db| {
            let task = Task::get(&ctx.db, task_id)?;
            let machine = Machine::get(&ctx.db, task.machine_id)?;

            if task.status.is_settled() {
                Err(anyhow!("Cannot pause a task that is not running"))?;
            }

            if machine.pausing_task_id == Some(task.id) {
                // handle redundant calls as a no-op to pause idempotently
                return Ok(task);
            }

            let print = task.print.ok_or_else(|| anyhow!("Task is not a print"))?;

            machine.pausing_task_id = Some(task.id);
            machine.insert(&db);

            // TODO: how to share spool task logic?
            spool_task(core_plugin.model.pause_hook)?;

            Ok(task)
        })?;

        Ok(task)
    }
}
