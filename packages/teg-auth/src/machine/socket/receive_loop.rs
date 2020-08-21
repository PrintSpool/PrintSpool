// use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;

use std::convert::TryInto;
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
    machine_message::{self, Status},
};

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
    // TaskContent,
};

use crate::machine::models::{
    Machine,
    MachineStatus,
};

use super::receive_message;

pub async fn run_receive_loop(
    _client_id: u32,
    ctx: Arc<crate::Context>,
    machine_id: u64,
    mut stream: UnixStream,
) -> Result<()> {
    info!("Machine #{:?}: Receive Loop Started", machine_id);
    let mut previous_status = Status::Disconnected as i32;
    loop {
        let message = receive_message(&mut stream).await?;
        info!("Machine #{:?}: Socket Message Received", machine_id);

        if let Some(machine_message::Payload::Feedback(feedback)) = message.payload {
            record_feedback(feedback, &ctx, machine_id, &mut previous_status).await?;
        }
    }
}

pub async fn record_feedback(
    feedback: machine_message::Feedback,
    ctx: &Arc<crate::Context>,
    machine_id: u64,
    previous_status: &mut i32,
) -> Result<()> {
    // Record task progress
    for progress in feedback.task_progress.iter() {
        let status = progress.try_into()?;

        Task::get_and_update(
            &ctx.db,
            progress.task_id as u64,
            |mut task| {
                task.despooled_line_number = Some(progress.despooled_line_number as u64);
                task.status = status;
                task
            }
        )?;
    }

    info!("Feedback status: {:?}", feedback.status);
    // Update machine status
    if feedback.status != *previous_status {
        *previous_status = feedback.status;

        let next_machine_status = match feedback.status {
            i if i == Status::Errored as i32 => MachineStatus::Errored,
            i if i == Status::Estopped as i32 => MachineStatus::Stopped,
            i if i == Status::Disconnected as i32 => MachineStatus::Disconnected,
            i if i == Status::Connecting as i32 => MachineStatus::Connecting,
            i if i == Status::Ready as i32 => MachineStatus::Ready,
            i => Err(anyhow!("Invalid machine status: {:?}", i))?,
        };

        Machine::set_status(
            &ctx.db,
            machine_id,
            |_| next_machine_status.clone(),
        )?;
    }

    Ok(())
}
