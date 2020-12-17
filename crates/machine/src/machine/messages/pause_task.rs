use xactor::*;
use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

#[message(result = "()")]
pub struct PauseTask {
    task_id: u64,
}

impl From<PauseTask> for CombinatorMessage {
    fn from(msg: PauseTask) -> CombinatorMessage {
        CombinatorMessage {
            payload: Some(
                combinator_message::Payload::PauseTask(
                    combinator_message::PauseTask { task_id: msg.task_id as u32 }
                )
            ),
        }
    }
}

// #[async_trait::async_trait]
// impl Handler<PauseTask> for Machine {
//     async fn handle(&mut self, _ctx: &mut Context<Self>, msg: PauseTask) -> () {
//         self.send_message(msg.into())
//     }
// }
