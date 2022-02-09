use chrono::prelude::*;
use printspool_json_store::Record as _;
use printspool_protobufs::{
    ServerMessage,
    server_message,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::machine::{Machine, MachineStatus, Printing};
use crate::task::{Paused, Task, TaskStatus};

use super::SpoolTask;

#[xactor::message(result = "Result<Task>")]
pub struct PauseTask {
    pub task_id: crate::DbId,
    pub pause_hook: Task,
}

#[async_trait::async_trait]
impl xactor::Handler<PauseTask> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: PauseTask) -> Result<Task> {
        if self.get_data()?.config.axes
            .iter()
            .any(|axis| !axis.ephemeral.homed)
        {
            return Err(eyre!((r#"
                Prints cannot be paused when axes are not homed. When un-homed the machine does not
                know the position of each axis so it would not know where to resume from after the
                pause.
            "#).to_string()))
        }

        let mut tx = self.db.begin().await?;
        // Re-fetch the task within the transaction
        let mut task = Task::get(&mut tx, &msg.task_id, false).await?;

        if task.status.is_settled() {
            return Err(eyre!("Cannot pause a task that is not running"));
        }

        if !task.is_print() {
            return Err(eyre!("Cannot pause task because task is not a print"));
        }

        if task.status.is_paused() {
            // handle redundant calls as a no-op to pause idempotently
            return Ok(task);
        }

        task.status = TaskStatus::Paused(Paused {
            paused_at: Utc::now(),
        });

        task.update(&mut tx).await?;
        msg.pause_hook.insert_no_rollback(&mut tx).await?;

        tx.commit().await?;

        self.get_data()?.status = MachineStatus::Printing(Printing {
            task_id: msg.task_id.clone(),
            paused: true,
            paused_state: None,
        });

        let protobuf_msg = ServerMessage {
            payload: Some(
                server_message::Payload::PauseTask(
                    server_message::PauseTask { task_id: msg.task_id.clone() }
                )
            ),
        };

        if let Err(err) = self.send_message(protobuf_msg).await {
            error!("Error pausing task on machine #{}: {:?}", self.id, err);
            ctx.stop(Some(err));
        };

        self.handle(
            ctx,
            SpoolTask { task: msg.pause_hook },
        ).await?;

        info!("Paused Print #{}", msg.task_id);

        Ok(task)
    }
}
