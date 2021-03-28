use teg_protobufs::{
    ServerMessage,
    server_message,
};

use crate::machine::Machine;

#[xactor::message(result = "()")]
pub struct ResetMachine;

impl From<ResetMachine> for ServerMessage {
    fn from(_msg: ResetMachine) -> ServerMessage {
        ServerMessage {
            payload: Some(
                server_message::Payload::Reset(
                    server_message::Reset {}
                )
            ),
        }
    }
}

#[async_trait::async_trait]
impl xactor::Handler<ResetMachine> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: ResetMachine) -> () {
        if let Err(err) = self.send_message(msg.into()).await {
            error!("Error resetting machine #{}: {:?}", self.id, err);
            ctx.stop(Some(err));
        };
    }
}
