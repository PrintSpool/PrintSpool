use printspool_protobufs::{
    ServerMessage,
    server_message,
};

use crate::machine::Machine;

#[xactor::message(result = "()")]
pub struct StopMachine;

impl From<StopMachine> for ServerMessage {
    fn from(_msg: StopMachine) -> ServerMessage {
        ServerMessage {
            payload: Some(
                server_message::Payload::Estop(
                    server_message::EStop {}
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
