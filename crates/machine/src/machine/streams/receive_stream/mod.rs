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

mod codec;
mod record_feedback;
use record_feedback::record_feedback;

#[async_trait::async_trait]
impl StreamHandler<MachineMessage> for Machine {
    async fn handle(&mut self, ctx: &mut XContext<Self>, msg: MachineMessage) {
        trace!("Machine #{:?}: Socket Message Received", self.data.config.id);

        let feedback = match msg.payload {
            Some(
                machine_message::Payload::Feedback(feedback)
            ) => feedback,
            _ => return,
        };

        if let Err(err) = record_feedback(self, feedback).await {
            error!("Restarting machine #{} due to rx error: {:?}", self.data.config.id, err);
            ctx.stop(Some(err));
        };
    }

    async fn started(&mut self, _ctx: &mut XContext<Self>) {
        info!("Machine #{:?}: Receive Loop Started", self.data.config.id);
    }

    async fn finished(&mut self, _ctx: &mut XContext<Self>) {
        info!("Machine #{:?}: Receive Loop Finished", self.data.config.id);
    }
}
