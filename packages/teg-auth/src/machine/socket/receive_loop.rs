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
    Axis,
    SpeedController,
    GCodeHistoryDirection,
    GCodeHistoryEntry,
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
    let heaters = Heater::scan(&ctx.db)
        .collect::<Result<Vec<Heater>>>()?;

    for h in feedback.heaters.iter() {
        let id = heaters.iter()
            .find(|heater| heater.address == h.address)
            .map(|heater| heater.id);

        let id = if let Some(id) = id {
            id
        } else {
            warn!("Heater not found: {}", h.address);
            continue
        };

        let temperature_history_id = Heater::generate_id(&ctx.db)?;

        Heater::get_and_update(&ctx.db, id, |mut heater| {
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

    // Update axes
    let axes = Axis::scan(&ctx.db)
        .collect::<Result<Vec<Axis>>>()?;

    for a in feedback.axes.iter() {
        let id = axes.iter()
            .find(|axis| axis.address == a.address)
            .map(|axis| axis.id);

        let id = if let Some(id) = id {
            id
        } else {
            warn!("axes not found: {}", a.address);
            continue
        };

        Axis::get_and_update(&ctx.db, id, |mut axis| {
            Axis {
                target_position: Some(a.target_position),
                actual_position: Some(a.actual_position),
                homed: a.homed,
                ..axis
            }
        });
    }

    // Update speed controllers
    let speed_controllers = SpeedController::scan(&ctx.db)
        .collect::<Result<Vec<SpeedController>>>()?;

    for sc in feedback.speed_controllers.iter() {
        let id = speed_controllers.iter()
            .find(|speed_controller| speed_controller.address == sc.address)
            .map(|speed_controller| speed_controller.id);

        let id = if let Some(id) = id {
            id
        } else {
            warn!("speed_controllers not found: {}", sc.address);
            continue
        };

        SpeedController::get_and_update(&ctx.db, id, |mut speed_controller| {
            SpeedController {
                target_speed: Some(sc.target_speed),
                actual_speed: Some(sc.actual_speed),
                enabled: sc.enabled,
                ..speed_controller
            }
        });
    }

    // Update GCode History
    let history = if let mut Some(ephemeral) = ctx.ephemeral_machine_data.get_mut(&machine_id) {
        &mut ephemeral.gcode_history
    } else {
        return Err(anyhow!("Machine (id: {}) ephemeral data not found", machine_id));
    };

    for entry in feedback.gcode_history.iter() {
        let direction = if entry.direction == 0 {
            GCodeHistoryDirection::Tx
        } else {
            GCodeHistoryDirection::Rx
        };

        history.push_back(
            GCodeHistoryEntry::new(
                Machine::generate_id(&ctx.db)?,
                entry.content.clone(),
                direction,
            )
        );

        const max_history_length: usize = 400;
        while history.len() > max_history_length {
            history.pop_front();
        };
    }

    Ok(())
}
