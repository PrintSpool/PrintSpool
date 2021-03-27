use eyre::{
    eyre,
    // Context as _,
};
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use machine::messages::{GetData, ResumeTask};
use teg_json_store::Record;
use teg_machine::{MachineMap, machine, task::{Task, TaskStatus}};

use crate::task_from_hook;

#[derive(Default)]
pub struct ResumePrintMutation;

#[async_graphql::Object]
impl ResumePrintMutation {
    /// Resumes a paused print
    async fn resume_print<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(name="taskID")]
        task_id: ID,
    ) -> FieldResult<Task> {
        let db: &crate::Db = ctx.data()?;

        let task = Task::get(db, &task_id, false).await?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();
        let machine = machines.get(&(&task.machine_id).into())
            .ok_or_else(||
                eyre!("machine (ID: {}) not found for print pause", task.machine_id)
            )?;

        let config = machine.call(GetData).await??.config;
        let core_plugin = config.core_plugin()?;

        let resume_hook = task_from_hook(
            &task.machine_id,
            machine.clone(),
            &core_plugin.model.resume_hook,
        ).await?;

        let mut tx = db.begin().await?;
        // Re-fetch the task within the transaction
        let mut task = Task::get(&mut tx, &task_id, false).await?;

        if task.status.is_settled() {
            Err(eyre!("Cannot resume a task that is {}", task.status.to_db_str()))?;
        }

        if !task.is_print() {
            Err(eyre!("Cannot resume task because task is not a print"))?;
        }

        if !task.status.is_paused() {
            // handle redundant calls as a no-op to pause idempotently
            return Ok(task);
        }

        task.status = TaskStatus::Spooled;

        task.update(&mut tx).await?;
        resume_hook.insert_no_rollback(&mut tx).await?;

        tx.commit().await?;

        // Spool the resume hook and then the task
        let msg = ResumeTask {
            task: task,
            resume_hook,
        };
        let task = machine.call(msg).await??;

        Ok(task)
    }
}
