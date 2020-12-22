// use async_std::prelude::*;
use chrono::{ prelude::*, Duration };
use machine_message::Feedback;

use std::convert::TryInto;
// use std::sync::Arc;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use teg_protobufs::{
    machine_message::{self, Status},
};

use crate::task::{
    Task,
    // TaskContent,
};
use crate::machine::{
    Machine,
    models::{
        MachineStatus,
        GCodeHistoryEntry,
        GCodeHistoryDirection,
        Errored,
    },
};
use crate::components::{
    HeaterEphemeral,
    TemperatureHistoryEntry,
    Axis,
    SpeedController,
};

pub async fn update_tasks(db: &crate::Db, feedback: &Feedback) -> Result<()> {
    for progress in feedback.task_progress.iter() {
        let status = progress.try_into()?;

        let task = sqlx::query_as("SELECT * FROM tasks WHERE id = ?")
            .bind(progress.task_id)
            .fetch_one(db)
            .await?;

        let task: Task = serde_json::from_str(task.json)?;

        trace!("Task #{} status: {:?}", task.id, status);
        task.despooled_line_number = Some(progress.despooled_line_number as u64);
        task.status = status;

        task.update(db);
    }

    Ok(())
}

pub async fn update_heaters(machine: &mut Machine, feedback: &Feedback) -> Result<()> {
    for h in feedback.heaters.iter() {
        let heater = machine.data.config.get_mut_heater(h.address);

        let heater = if let Some(heater) = heater {
            heater
        } else {
            warn!("Heater not found: {}", h.address);
            continue
        };

        let temperature_history_id = Heater::generate_id(&self.db)?;

        let history = &mut heater.history;

        // record a data point once every half second
        if
            history.back()
                .map(|last| Utc::now() > last.created_at + Duration::milliseconds(500))
                .unwrap_or(true)
        {
            history.push_back(
                TemperatureHistoryEntry {
                    target_temperature: Some(h.target_temperature),
                    actual_temperature: Some(h.actual_temperature),
                    ..TemperatureHistoryEntry::new(temperature_history_id)
                }
            );
        }

        // limit the history to 60 entries (30 seconds)
        const MAX_HISTORY_LENGTH: usize = 60;
        while history.len() > MAX_HISTORY_LENGTH {
            history.pop_front();
        };

        heater.target_temperature = Some(h.target_temperature);
        heater.actual_temperature = Some(h.actual_temperature);
        heater.enabled = h.enabled;
        heater.blocking = h.blocking;
    }

    Ok(())
}

pub async fn update_axes(machine: &mut Machine, feedback: &Feedback) -> Result<()> {
    let axes = machine.data.config.axes;

    for a in feedback.axes.iter() {
        let id = axes.iter()
            .find(|axis| axis.address == a.address)
            .map(|axis| axis.id);

        let axis = axes.iter_mut()
            .find(|c| c.model.address == a.address)
            .map(|c| &mut c.ephemeral);

        let axis = if let Some(axis) = axis {
            axis
        } else {
            warn!("axes not found: {}", a.address);
            continue
        };

        axis.target_position = Some(a.target_position);
        axis.actual_position = Some(a.actual_position);
        axis.homed = a.homed;
    }

    Ok(())
}

pub async fn update_speed_controllers(machine: &mut Machine, feedback: &Feedback) -> Result<()> {
    let speed_controllers = machine.data.config.speed_controllers;

    for sc in feedback.speed_controllers.iter() {
        let id = speed_controllers.iter()
            .find(|speed_controller| speed_controller.address == sc.address)
            .map(|speed_controller| speed_controller.id);

        let sc_eph = speed_controllers.iter_mut()
            .find(|c| c.model.address == a.address)
            .map(|c| &mut c.ephemeral);

        let sc_eph = if let Some(sc_eph) = sc_eph {
            sc_eph
        } else {
            warn!("speed_controllers not found: {}", sc.address);
            continue
        };

        sc_eph.target_speed = Some(sc.target_speed);
        sc_eph.actual_speed = Some(sc.actual_speed);
        sc_eph.enabled = sc.enabled;
    }

    Ok(())
}

pub async fn update_machine(machine: &mut Machine, feedback: &Feedback) -> Result<()> {
    trace!("Feedback status: {:?}", feedback.status);
    // Update machine status
    machine.data.status = match feedback.status {
        i if i == Status::Errored as i32 && feedback.error.is_some() => {
            let message = feedback.error.as_ref().unwrap().message.clone();
            MachineStatus::Errored(Errored { message })
        }
        i if i == Status::Estopped as i32 => MachineStatus::Stopped,
        i if i == Status::Disconnected as i32 => MachineStatus::Disconnected,
        i if i == Status::Connecting as i32 => MachineStatus::Connecting,
        i if i == Status::Ready as i32 => MachineStatus::Ready,
        i => Err(anyhow!("Invalid machine status: {:?}", i))?,
    };

    machine.data.motors_enabled = feedback.motors_enabled;

    // Update GCode History
    let history = &mut machine.data.gcode_history;

    for entry in feedback.gcode_history.iter() {
        let direction = if entry.direction == 0 {
            GCodeHistoryDirection::Tx
        } else {
            GCodeHistoryDirection::Rx
        };

        history.push_back(
            GCodeHistoryEntry::new(
                Machine::generate_id()?,
                entry.content.clone(),
                direction,
            )
        );

        const MAX_HISTORY_LENGTH: usize = 400;
        while history.len() > MAX_HISTORY_LENGTH {
            history.pop_front();
        };
    }

    Ok(())
}

pub async fn record_feedback(machine: &mut Machine, feedback: Feedback) -> Result<()> {
    let db = &machine.db;
    let transaction = db.begin().await?;

    update_tasks(db, &feedback).await;
    update_heaters(machine, &feedback).await;
    update_axes(machine, &feedback).await;
    update_speed_controllers(machine, &feedback).await;

    update_machine(machine, &feedback).await;

    transaction.commit().await?;

    Ok(())
}
