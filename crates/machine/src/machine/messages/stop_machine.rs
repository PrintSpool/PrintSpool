use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

use crate::machine::Machine;

#[xactor::message(result = "()")]
pub struct StopMachine;

impl From<StopMachine> for CombinatorMessage {
    fn from(_msg: StopMachine) -> CombinatorMessage {
        CombinatorMessage {
            payload: Some(
                combinator_message::Payload::Estop(
                    combinator_message::EStop {}
                )
            ),
        }
    }
}

#[async_trait::async_trait]
impl xactor::Handler<StopMachine> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: StopMachine) -> () {
        if let Err(err) = self.send_message(msg.into()).await {
            error!("Error stopping machine #{}: {:?}", self.id, err);
            ctx.stop(Some(err));
        };
    }
}
