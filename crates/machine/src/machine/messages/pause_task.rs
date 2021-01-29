use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{machine::Machine, task::Task};

use super::SpoolTask;

#[xactor::message(result = "Result<()>")]
pub struct PauseTask {
    pub task_id: crate::DbId,
    pub pause_hook: Task,
}

#[async_trait::async_trait]
impl xactor::Handler<PauseTask> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: PauseTask) -> Result<()> {
        self.get_data()?.paused_task_id = Some(msg.task_id.clone());

        let protobuf_msg = CombinatorMessage {
            payload: Some(
                combinator_message::Payload::PauseTask(
                    combinator_message::PauseTask { task_id: msg.task_id.clone() }
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

        Ok(())
    }
}
