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
pub struct PausePrintMutation;

#[Object]
impl PausePrintMutation {
    /// Pauses a print
    async fn pause_print<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[arg(name="taskID")]
        task_id: ID,
    ) -> FieldResult<Task> {
        let task_id = task_id.parse::<u64>()
            .with_context(|| format!("Invalid task id: {:?}", task_id))?;

        let ctx: &Arc<crate::Context> = ctx.data()?;
        let config = ctx.machine_config.load();
        let core_plugin = config.core_plugin()?;

        let task = Task::get(&ctx.db, task_id)?;
        let pause_hook = Task::from_hook(
            task.machine_id,
            &core_plugin.model.pause_hook,
            ctx,
        ).await?;

        let task = ctx.db.transaction(|db| {
            let task = Task::get(&ctx.db, task_id)?;
            let mut machine = Machine::get(&ctx.db, task.machine_id)?;

            if task.status.is_settled() {
                Err(
                    VersionedModelError::from(anyhow!("Cannot pause a task that is not running")),
                )?;
            }

            task.print.as_ref().ok_or_else(|| {
                VersionedModelError::from(anyhow!("Task is not a print"))
            })?;

            if machine.pausing_task_id == Some(task.id) {
                // handle redundant calls as a no-op to pause idempotently
                return Ok(task);
            }

            machine.pausing_task_id = Some(task.id);
            machine.insert(&db)?;

            pause_hook.clone().insert(&db)?;

            Ok(task)
        })?;

        Ok(task)
    }
}
