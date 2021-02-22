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

use crate::machine::{
    Machine,
    MachineStatus,
};
use crate::machine::messages::ConnectToSocket;

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

        // Reset the machine except for `status = Stopped` and attempt a new socket connection
        self.attempting_to_connect = false;
        self.write_stream = None;
        self.unix_socket = None;
        self.attempting_to_connect = false;
        self.has_received_feedback = false;

        let is_stopped = self.data.as_ref()
            .map(|m| m.status.is_stopped())
            .unwrap_or(false);

        // Reset the machine data
        if let Err(err) = self.reset_data().await {
            warn!("Error resetting machine data: {:?}", err);
            ctx.stop(Some(err));
        };

        // Set the status of the new machine data if the machine was previously stopped
        if is_stopped {
            self.data
                .as_mut()
                .map(|data| data.status = MachineStatus::Stopped);
        }

        if let Err(err) = ctx.address().send(ConnectToSocket) {
            warn!("Error restarting machine: {:?}", err);
            ctx.stop(Some(err));
        };
    }
}
