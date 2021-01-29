use async_codec::ReadFrameError;
use xactor::{
    StreamHandler,
    Context as XContext,
};

use teg_protobufs::{
    MachineMessage,
    // Message,
    machine_message,
};

use crate::machine::Machine;

pub mod codec;
mod record_feedback;
use record_feedback::record_feedback;

type RxResult = std::result::Result<MachineMessage, ReadFrameError<eyre::Error>>;

#[async_trait::async_trait]
impl StreamHandler<RxResult> for Machine
{
    #[instrument(fields(id = &self.id[..]), skip(self, ctx))]
    async fn handle(&mut self, ctx: &mut XContext<Self>, msg: RxResult) {
        // Handle invalid byte streams
        let msg = match msg {
            Ok(msg) => msg,
            Err(ReadFrameError::Decode(err)) => {
                return ctx.stop(Some(err));
            }
            Err(ReadFrameError::Io(err)) => {
                return ctx.stop(Some(err.into()));
            }
        };

        trace!("Socket Message Received");

        let feedback = match msg.payload {
            Some(
                machine_message::Payload::Feedback(feedback)
            ) => feedback,
            _ => return,
        };

        if let Err(err) = record_feedback(self, feedback).await {
            error!("Restarting machine #{} due to rx error: {:?}", self.id, err);
            ctx.stop(Some(err));
        };
    }

    async fn started(&mut self, _ctx: &mut XContext<Self>) {
        info!("Machine #{:?}: Receive Loop Started", self.id);
    }

    async fn finished(&mut self, ctx: &mut XContext<Self>) {
        info!("Machine #{:?} Socket Closed", self.id);

        let shutdown_result = self.unix_socket
            .as_ref()
            .map(|socket|
                socket.shutdown(async_std::net::Shutdown::Both)
            );

        match shutdown_result {
            Some(Err(err)) => warn!("Error cleaning up socket: {:?}", err),
            None => warn!("No machine socket found"),
            _ => {}
        };

        // Restart the machine actor & attempt a new socket connection
        ctx.stop(None);
        // ctx.address().send(ConnectToSocket());
    }
}
