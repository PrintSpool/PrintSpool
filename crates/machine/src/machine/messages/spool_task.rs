use teg_json_store::Record;
use teg_protobufs::{
    ServerMessage,
    server_message,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::{machine::Machine, task::{Created, Task, TaskContent, TaskStatus}};

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

        let task_id = task.id.clone();

        self.get_data()?.status.verify_can_start(&task, false)?;

        let (_, task) = self.spool_task(task)
            .await
            .map_err(|err| {
                error!("Error spooling task #{}: {:?}", task_id, err);
                ctx.stop(Some(err));

                eyre!("Unable to spool task")
            })?;

        Ok(task)
    }
}

impl Machine {
    pub async fn spool_task(
        &mut self,
        mut task: Task,
    ) -> Result<(&mut Self, Task)> {
        // client_id is a placeholder for now. It could allow multiple servers to connect
        // to a single machine driver process in future if that is needed but for now it does
        // nothing.
        let client_id = "42".to_string(); // Chosen at random. Very legit.

        info!("spooling task");

        let content = match &task.content {
            TaskContent::FilePath(file_path) => {
                server_message::spool_task::Content::FilePath(
                    file_path.clone().into_os_string().into_string().unwrap(),
                )
            }
            TaskContent::GCodes(gcodes) => {
                server_message::spool_task::Content::Inline(
                    server_message::InlineContent {
                        commands: gcodes.clone(),
                    },
                )
            }
        };

        let start_at_line_number = task.despooled_line_number
            .map(|n| n + 1)
            .unwrap_or(0);

        let message = ServerMessage {
            payload: Some(
                server_message::Payload::SpoolTask(
                    server_message::SpoolTask {
                        task_id: task.id.clone(),
                        client_id,
                        start_at_line_number,
                        machine_override: task.machine_override,
                        content: Some(content),
                    }
                )
            ),
        };

        let this = self.send_message(message).await?;

        task.status = TaskStatus::Created(Created { sent_to_driver: true });
        task.update(&this.db).await?;

        Ok((this, task))
    }
}
