use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

use crate::machine::Machine;

#[xactor::message(result = "()")]
pub struct ResetWhenIdle;

impl From<ResetWhenIdle> for CombinatorMessage {
    fn from(_msg: ResetWhenIdle) -> CombinatorMessage {
        CombinatorMessage {
            payload: Some(
                combinator_message::Payload::ResetWhenIdle(
                    combinator_message::Reset {}
                )
            ),
        }
    }
}


#[async_trait::async_trait]
impl xactor::Handler<ResetWhenIdle> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: ResetWhenIdle) -> () {
        if let Err(err) = self.send_message(msg.into()).await {
            error!("Error resetting machine #{}: {:?}", self.id, err);
            ctx.stop(Some(err));
        };
    }
}
