use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{machine::Machine, task::Task};

use super::SpoolTask;

#[xactor::message(result = "Result<Task>")]
pub struct ResumeTask {
    pub task: Task,
    pub resume_hook: Task,
}

#[async_trait::async_trait]
impl xactor::Handler<ResumeTask> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: ResumeTask) -> Result<Task> {
        self.get_data()?.paused_task_id = None;

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

        Ok(task)
    }
}
