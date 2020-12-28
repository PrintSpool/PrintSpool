use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

use crate::machine::Machine;

#[xactor::message(result = "()")]
pub struct ResetMachine();

impl From<ResetMachine> for CombinatorMessage {
    fn from(_msg: ResetMachine) -> CombinatorMessage {
        CombinatorMessage {
            payload: Some(
                combinator_message::Payload::Reset(
                    combinator_message::Reset {}
                )
            ),
        }
    }
}

#[async_trait::async_trait]
impl xactor::Handler<ResetMachine> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: ResetMachine) -> () {
        if let Err(err) = self.send_message(msg.into()).await {
            error!("Error resetting machine #{}: {:?}", self.data.config.id, err);
            ctx.stop(Some(err));
        };
    }
}
