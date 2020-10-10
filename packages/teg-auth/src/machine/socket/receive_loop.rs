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
    Errored
};

use super::receive_message;

pub async fn run_receive_loop(
    _client_id: u32,
    ctx: Arc<crate::Context>,
    machine_id: u64,
    mut stream: UnixStream,
) -> Result<()> {
    info!("Machine #{:?}: Receive Loop Started", machine_id);
    loop {
        let message = receive_message(&mut stream).await?;
        trace!("Machine #{:?}: Socket Message Received", machine_id);

        if let Some(machine_message::Payload::Feedback(feedback)) = message.payload {
            record_feedback(feedback, &ctx, machine_id).await?;
        }
    }
}

pub async fn record_feedback(
    feedback: machine_message::Feedback,
    ctx: &Arc<crate::Context>,
    machine_id: u64,
) -> Result<()> {
    // Record task progress
    for progress in feedback.task_progress.iter() {
        let status = progress.try_into()?;

        Task::get_opt_and_update(
            &ctx.db,
            progress.task_id as u64,
            |task| task.map(|mut task| {
                trace!("Task #{} status: {:?}", task.id, status);
                task.despooled_line_number = Some(progress.despooled_line_number as u64);
                task.status = status;
                task
            })
        )?;
    }

    trace!("Feedback status: {:?}", feedback.status);
    // Update machine status
    let next_machine_status = match feedback.status {
        i if i == Status::Errored as i32 && feedback.error.is_some() => {
            let message = feedback.error.unwrap().message;
            MachineStatus::Errored(Errored { message })
        }
        i if i == Status::Estopped as i32 => MachineStatus::Stopped,
        i if i == Status::Disconnected as i32 => MachineStatus::Disconnected,
        i if i == Status::Connecting as i32 => MachineStatus::Connecting,
        i if i == Status::Ready as i32 => MachineStatus::Ready,
        i => Err(anyhow!("Invalid machine status: {:?}", i))?,
    };

    let motors_enabled = feedback.motors_enabled;

    Machine::set_status(
        &ctx.db,
        machine_id,
        |machine| {
            machine.motors_enabled = motors_enabled;
            next_machine_status.clone()
        },
    )?;

    Ok(())
}
