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
    // MachineMessage,
    // Message,
    machine_message,
};

use crate::machine::models::{
    RecordFeedback,
};

use super::receive_message;

pub async fn run_receive_loop(
    _client_id: crate::DbId,
    ctx: Arc<crate::Context>,
    machine_id: crate::DbId,
    mut stream: UnixStream,
) -> Result<()> {
    info!("Machine #{:?}: Receive Loop Started", machine_id);
    loop {
        let message = receive_message(&mut stream).await?;
        trace!("Machine #{:?}: Socket Message Received", machine_id);

        if let Some(machine_message::Payload::Feedback(feedback)) = message.payload {
            let machine = ctx.ephemeral_machine_data.get(&machine_id)
                .ok_or(anyhow!("Unable to find machine (id: {:?})", machine_id))?;
            machine.call(RecordFeedback(feedback)).await??;
        }
    }
}
