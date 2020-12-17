// use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;
// use chrono::{ prelude::*, Duration };

// use std::convert::TryInto;
use std::sync::Arc;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
// use bytes::BufMut;

use teg_protobufs::{
    MachineMessage,
    // Message,
    machine_message,
};

use crate::machine::models::{
    RecordFeedback,
};

mod codec;
mod record_feedback;
use record_feedback::record_feedback;

#[async_trait::async_trait]
impl StreamHandler<MachineMessage> for Machine {
    async fn handle(&mut self, _ctx: &mut Context<Self>, msg: MachineMessage) {
        trace!("Machine #{:?}: Socket Message Received", machine_id);

        if let Some(machine_message::Payload::Feedback(feedback)) = message.payload {
            // TODO: kill the actor if record_feedback errors
            record_feedback(&mut self).await?
        }
    }

    async fn started(&mut self, _ctx: &mut Context<Self>) {
        info!("Machine #{:?}: Receive Loop Started", self.id);
    }

    async fn finished(&mut self, _ctx: &mut Context<Self>) {
        info!("Machine #{:?}: Receive Loop Finished", self.id);
    }
}
