// use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;
use async_graphql::ID;

use std::sync::Arc;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
// use bytes::BufMut;

use teg_protobufs::{
    // MachineMessage,
    // Message,
    machine_message,
};

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
    TaskStatus,
    // TaskContent,
};

use crate::machine::models::Machine;

use super::receive_message;

pub async fn run_receive_loop(
    _client_id: u32,
    ctx: Arc<crate::Context>,
    machine_id: ID,
    mut stream: UnixStream,
) -> Result<()> {
    loop {
        let message = receive_message(&mut stream).await?;

        if let Some(machine_message::Payload::Feedback(feedback)) = message.payload {
            record_feedback(feedback, &ctx, &machine_id).await?;
        }
    }
}

pub async fn record_feedback(
    feedback: machine_message::Feedback,
    ctx: &Arc<crate::Context>,
    machine_id: &ID,
) -> Result<()> {
    // Record task progress
    for progress in feedback.task_progress.iter() {
        Task::fetch_and_update(
            &ctx.db,
            &progress.task_id.to_string().into(),
            |task| {
                task.map(|mut task| {
                    task.despooled_line_number = Some(progress.despooled_line_number as u64);
                    task
                })
            }
        )?;
    }

    // TODO: Record task events
    for event in feedback.events.iter() {
        Task::fetch_and_update(
            &ctx.db,
            &event.task_id.to_string().into(),
            |task| {
                task.map(|mut task| {
                    // TODO: record event history
                    // task.status = event.status;
                    task
                })
            }
        )?;
    }

    // Record changes in machine state
    let machine = Machine::get(&ctx.db, machine_id)?;
    if
        machine.status.is_driver_ready()
        && feedback.status != machine_message::Status::Ready as i32
    {
        for task in Task::scan(&ctx.db) {
            let task = task?;

            if task.status.is_pending() {
                Task::fetch_and_update(
                    &ctx.db,
                    &task.id,
                    |task| {
                        task.map(|mut task| {
                            task.status = TaskStatus::Errored;
                            task
                        })
                    }
                )?;
            }
        }
    }

    Ok(())
}
