use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use teg_json_store::UnsavedRecord as _;

use crate::{machine::Machine, task::{AnyTask, Task, TaskContent}};

// use crate::machine::Machine;

#[xactor::message(result = "Result<Task>")]
#[derive(Debug)]
pub struct SpoolTask {
    task: AnyTask,
}

#[async_trait::async_trait]
impl xactor::Handler<SpoolTask> for Machine {
    #[instrument(skip(self, _ctx))]
    async fn handle(
        &mut self,
        _ctx: &mut xactor::Context<Self>,
        msg: SpoolTask
    ) -> Result<Task> {
        let SpoolTask {
            task
        } = msg;

        let client_id: crate::DbId = 42; // Chosen at random. Very legit.

        let machine = self.get_data()?;

        if !machine.status.can_start_task(&task, false) {
            Err(anyhow!("Cannot start task while machine is: {:?}", machine.status))?;
        };

        info!("spooling task");

        let task = match task {
            AnyTask::Saved(task) => task,
            AnyTask::Unsaved(task) => task.insert(&self.db).await?,
        };

        let content = match &task.content {
            TaskContent::FilePath(file_path) => {
                combinator_message::spool_task::Content::FilePath(file_path.clone())
            }
            TaskContent::GCodes(gcodes) => {
                combinator_message::spool_task::Content::Inline(
                    combinator_message::InlineContent {
                        commands: gcodes.clone(),
                    },
                )
            }
        };

        let start_at_line_number = task.despooled_line_number
            .map(|n| n + 1)
            .unwrap_or(0);

        let message = CombinatorMessage {
            payload: Some(
                combinator_message::Payload::SpoolTask(
                    combinator_message::SpoolTask {
                        task_id: task.id,
                        client_id,
                        start_at_line_number,
                        machine_override: task.machine_override,
                        content: Some(content),
                    }
                )
            ),
        };

        self.send_message(message).await?;

        Ok(task)
    }
}
