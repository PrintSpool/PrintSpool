use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::{machine::{Machine, MachineStatus, Printing}, task::Task};

use super::SpoolTask;

#[xactor::message(result = "Result<Task>")]
pub struct ResumeTask {
    pub task: Task,
    pub resume_hook: Task,
}

#[async_trait::async_trait]
impl xactor::Handler<ResumeTask> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: ResumeTask) -> Result<Task> {
        // Verify this task was paused
        match &mut self.get_data()?.status {
            MachineStatus::Printing(
                status
            ) if status.paused && status.task_id == msg.task.id => (),
            _ => {
                return Err(eyre!("Cannot resume. This print is not paused."))
            }
        }

        let ResumeTask {
            task,
            resume_hook,
        } = msg;

        self.handle(
            ctx,
            SpoolTask { task: resume_hook },
        ).await?;

        let task = self.handle(
            ctx,
            SpoolTask { task },
        ).await?;

        // Update the machine status
        self.get_data()?.status = MachineStatus::Printing(Printing {
            task_id: task.id.clone(),
            paused: false,
            paused_state: None,
        });

        info!("Resumed Print #{}", task.id);

        Ok(task)
    }
}
