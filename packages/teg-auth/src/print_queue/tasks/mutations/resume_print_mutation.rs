use std::sync::Arc;
use async_graphql::*;
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

        let task = Task::get(&ctx.db, task_id)?;
        let resume_hook = Task::from_hook(
            task.machine_id,
            &core_plugin.model.resume_hook,
            ctx,
        ).await?;

        let (task, send_to_machine) = ctx.db.transaction(|db| {
            let task = Task::get(&db, task_id)?;
            let mut machine = Machine::get(&db, task.machine_id)?;

            if task.status.is_settled() {
                Err(
                    VersionedModelError::from(anyhow!("Cannot resume a task that is settled")),
                )?;
            }

            task.print.as_ref().ok_or_else(|| {
                VersionedModelError::from(anyhow!("Task is not a print"))
            })?;

            if machine.pausing_task_id.is_none() {
                // handle redundant calls as a no-op to resume idempotently
                return Ok((task, false));
            }

            if machine.pausing_task_id != Some(task.id) {
                Err(
                    VersionedModelError::from(anyhow!("Machine is paused on a different print")),
                )?;
            }

            machine.pausing_task_id = None;
            machine.insert(&db)?;

            resume_hook.clone().insert(&db)?;

            Ok((task, true))
        })?;

        if !send_to_machine {
            return Ok(task)
        }

        let task = Task::get_and_update(&ctx.db, task.id, |mut task| {
            task.sent_to_machine = false;
            task
        })?;

        Ok(task)
    }
}
