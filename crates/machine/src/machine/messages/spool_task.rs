use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::{machine::Machine, task::{Task, TaskContent}};

// use crate::machine::Machine;

#[xactor::message(result = "Result<Task>")]
#[derive(Debug)]
pub struct SpoolTask {
    pub task: Task,
}

#[async_trait::async_trait]
impl xactor::Handler<SpoolTask> for Machine {
    #[instrument(skip(self, ctx))]
    async fn handle(
        &mut self,
        ctx: &mut xactor::Context<Self>,
        msg: SpoolTask
    ) -> Result<Task> {
        let SpoolTask {
            task
        } = msg;

        // client_id is a placeholder for now. It could allow multiple servers to connect
        // to a single machine driver process in future if that is needed but for now it does
        // nothing.
        let client_id = "42".to_string(); // Chosen at random. Very legit.

        let machine = self.get_data()?;

        if !machine.status.can_start_task(&task, false) {
            Err(eyre!("Cannot start task while machine is: {:?}", machine.status))?;
        };

        info!("spooling task");

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
                        task_id: task.id.clone(),
                        client_id,
                        start_at_line_number,
                        machine_override: task.machine_override,
                        content: Some(content),
                    }
                )
            ),
        };

        if let Err(err) = self.send_message(message).await {
            error!("Error sending message #{}: {:?}", self.id, err);
            ctx.stop(Some(err));
        };

        Ok(task)
    }
}
