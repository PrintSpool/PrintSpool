use teg_protobufs::{
    ServerMessage,
    server_message,
};

use crate::machine::Machine;

#[xactor::message(result = "()")]
pub struct ResetWhenIdle;

impl From<ResetWhenIdle> for ServerMessage {
    fn from(_msg: ResetWhenIdle) -> ServerMessage {
        ServerMessage {
            payload: Some(
                server_message::Payload::ResetWhenIdle(
                    server_message::Reset {}
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
