use chrono::prelude::*;
use eyre::{
    Result,
    eyre,
    // Context as _,
};
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use machine::messages::{GetData, PauseTask};
use teg_json_store::Record;
use teg_machine::{MachineMap, machine, task::{Paused, Task, TaskStatus}};

use crate::{
    task_from_hook,
};

#[derive(Default)]
pub struct PausePrintMutation;

#[async_graphql::Object]
impl PausePrintMutation {
    /// Pauses a print
    async fn pause_print<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(name="taskID")]
        task_id: ID,
    ) -> FieldResult<Task> {
        let db: &crate::Db = ctx.data()?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            let task = Task::get(db, &task_id, false).await?;

            let machine = machines.get(&(&task.machine_id).into())
                .ok_or_else(||
                    eyre!("machine (ID: {}) not found for print pause", task.machine_id)
                )?;

            let config = machine.call(GetData).await??.config;
            let core_plugin = config.core_plugin()?;

            let pause_hook = task_from_hook(
                &task.machine_id,
                machine.clone(),
                &core_plugin.model.pause_hook,
            ).await?;

            let mut tx = db.begin().await?;
            // Re-fetch the task within the transaction
            let mut task = Task::get(&mut tx, &task_id, false).await?;

            if task.status.is_settled() {
                Err(eyre!("Cannot pause a task that is not running"))?;
            }

            if !task.is_print() {
                Err(eyre!("Cannot pause task because task is not a print"))?;
            }

            if task.status.is_paused() {
                // handle redundant calls as a no-op to pause idempotently
                return Ok(task);
            }

            task.status = TaskStatus::Paused(Paused {
                paused_at: Utc::now(),
            });

            task.update(&mut tx).await?;
            pause_hook.insert_no_rollback(&mut tx).await?;

            tx.commit().await?;

            // Pause the task and spool the pause hook
            let msg = PauseTask {
                task_id: task.id.clone(),
                pause_hook,
            };
            machine.call(msg).await??;

            Result::<_>::Ok(task)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
