// use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;
use chrono::{ prelude::*, Duration };

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
    Errored,
    Heater,
    TemperatureHistoryEntry,
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

    // Update heaters
    let heaters = Heater::scan(&ctx.db).collect::<Result<Vec<Heater>>>()?;

    for h in feedback.heaters.iter() {
        let heater = heaters.iter().find(|heater| heater.address == h.address);

        let heater_id = if let Some(heater_id) = heater.map(|heater| heater.id) {
            heater_id
        } else {
            warn!("Heater not found: {}", h.address);
            continue
        };

        let temperature_history_id = Heater::generate_id(&ctx.db)?;

        Heater::get_and_update(&ctx.db, heater_id, |mut heater| {
            let history = &mut heater.history;

            // record a data point once every half second
            if (
                history.back()
                    .map(|last| Utc::now() > last.created_at + Duration::milliseconds(500))
                    .unwrap_or(true)
            ) {
                history.push_back(
                    TemperatureHistoryEntry {
                        target_temperature: Some(h.target_temperature),
                        actual_temperature: Some(h.actual_temperature),
                        ..TemperatureHistoryEntry::new(temperature_history_id)
                    }
                );
            }

            // limit the history to 60 entries (30 seconds)
            const max_history_length: usize = 60;
            while history.len() > max_history_length {
                history.pop_front();
            };

            Heater {
                target_temperature: Some(h.target_temperature),
                actual_temperature: Some(h.actual_temperature),
                enabled: h.enabled,
                blocking: h.blocking,
                ..heater
            }
        });
    }

    Ok(())
}
