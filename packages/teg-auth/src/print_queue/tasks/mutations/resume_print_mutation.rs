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
pub struct ResumePrintMutation;

#[Object]
impl ResumePrintMutation {
    /// Resumes a paused print
    async fn resume_print<'ctx>(
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

        let (task, send_to_machine) = ctx.db.transaction(|db| {
            let task = Task::get(&db, task_id)?;
            let machine = Machine::get(&db, task.machine_id)?;

            if task.status.is_settled() {
                Err(anyhow!("Cannot resume a task that is settled")).into()?;
            }

            if machine.pausing_task_id.is_none() {
                // handle redundant calls as a no-op to resume idempotently
                return Ok((task, false));
            }

            if machine.pausing_task_id != Some(task.id) {
                Err(anyhow!("Machine is paused on a different print")).into()?;
            }

            let print = task.print.ok_or_else(|| anyhow!("Task is not a print")).into()?;

            machine.insert(&db)?;

            // TODO: how to share spool task logic?
            spool_task(core_plugin.model.resume_hook);

            Ok((task, true))
        })?;

        if !send_to_machine {
            return Ok(task)
        }

        let task = Task::get_and_update(&ctx.db, task.id, |task| {
            task.sent_to_machine = false;
            task
        })?;

        Ok(task)
    }
}
