use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

use crate::machine::Machine;

#[xactor::message(result = "()")]
pub struct PauseTask {
    task_id: crate::DbId,
}

impl From<PauseTask> for CombinatorMessage {
    fn from(msg: PauseTask) -> CombinatorMessage {
        CombinatorMessage {
            payload: Some(
                combinator_message::Payload::PauseTask(
                    combinator_message::PauseTask { task_id: msg.task_id }
                )
            ),
        }
    }
}

#[async_trait::async_trait]
impl xactor::Handler<PauseTask> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: PauseTask) -> () {
        self.data.paused_task_id = Some(msg.task_id);

        if let Err(err) = self.send_message(msg.into()).await {
            error!("Error pausing task on machine #{}: {:?}", self.data.config.id, err);
            ctx.stop(Some(err));
        };
    }
}
