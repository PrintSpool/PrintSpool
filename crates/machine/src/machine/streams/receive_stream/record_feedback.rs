use chrono::{ prelude::*, Duration };
use machine::messages::DeleteTaskHistory;
use xactor::{Service as _};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use teg_protobufs::{
    MachineFlags,
    machine_message::{self, Status},
};
use teg_json_store::{ Record as _ };

use machine_message::Feedback;
use crate::{machine::{
    self,
    PositioningUnits,
    Errored,
    GCodeHistoryDirection,
    GCodeHistoryEntry,
    Machine,
    MachineData,
    MachineStatus,
    Printing,
    events::TaskSettled,
}, task::Created};
use crate::task::{
    Task,
    TaskStatus,
    self,
};
use crate::components::{
    // HeaterEphemeral,
    TemperatureHistoryEntry,
    // Axis,
    // SpeedController,
};

pub async fn record_feedback(
    machine: &mut Machine,
    feedback: Feedback,
    ctx: &mut xactor::Context<Machine>,
) -> Result<()> {
    let db = machine.db.clone();
    let now = Utc::now();

    update_tasks(machine, &db, &feedback, &now, ctx).await?;

    let machine_data = machine.get_data()?;

    update_heaters(machine_data, &feedback, &now).await?;
    update_axes(machine_data, &feedback).await?;
    update_speed_controllers(machine_data, &feedback).await?;

    update_machine(&db, machine, &feedback, &now, ctx).await?;

    machine.has_received_feedback = true;
    Ok(())
}

pub async fn update_tasks(
    machine: &mut Machine,
    db: &crate::Db,
    feedback: &Feedback,
    now: &DateTime<Utc>,
    ctx: &mut xactor::Context<Machine>,
) -> Result<()> {
    // On first feedback error out any previously running tasks that have disapeared from the
    // driver.
    if !machine.has_received_feedback {
        let mut tasks = Task::tasks_running_on_machine(
            db,
            &machine.get_data()?.config.id,
        ).await?;

        for mut task in tasks.iter_mut() {
            // If the task is missing after reconnection then mark it as errored
            if task.status == TaskStatus::Created(Created { sent_to_driver: false }) {
                continue;
            }

            if
                !feedback.task_progress
                    .iter()
                    .any(|p| p.task_id == task.id)
            {
                let error_message = format!(
                    "Task (#{}) missing from driver, possibly due to driver crash.",
                    task.id
                );

                warn!("{}", error_message);

                task.status = TaskStatus::Errored(task::Errored {
                    message: error_message,
                    errored_at: *now,
                });

                let machine_hooks = machine.hooks.clone();
                let tx = db.begin().await?;
                task.settle_task(
                    tx,
                    &machine_hooks,
                    machine.data_ref()?,
                    &ctx.address(),
                ).await?;
            } else if
                // If the task is still present upon reconnection then update the printer status
                task.status.is_pending()
                && task.is_print()
            {
                info!("Reconnected and continuing Print #{}", task.id);
                machine.get_data()?.status = MachineStatus::Printing(
                    Printing {
                        task_id: task.id.clone(),
                        paused: false,
                        paused_state: None,
                    }
                );
            }
        }

        drop(tasks);
    }

    for progress in feedback.task_progress.iter() {
        let status = TaskStatus::from_task_progress(&progress, &feedback.error)?;

        let mut task = if let
            Ok(task) = Task::get(db, &progress.task_id, true).await
        {
            task
        } else {
            warn!(
                "Task #{} received in driver feedback but missing from server database",
                progress.task_id,
            );
            continue
        };

        trace!("Task #{} status: {:?}", task.id, status);
        task.despooled_line_number = Some(progress.despooled_line_number as u64);

        let status_changed = if
            !task.status.is_settled()
            // Prevent re-setting paused_at
            && !(task.status.is_paused() && status.is_paused())
        {
            // Update the task status if it has changed and was not previously settled
            task.status = status;
            true
        } else {
            false
        };

        // When a task is settled
        if status_changed && task.status.is_settled() {
            // Update the task and delete any temporary files
            let tx = db.begin().await?;
            let machine_hooks = machine.hooks.clone();

            task.settle_task(
                tx,
                &machine_hooks,
                machine.data_ref()?,
                &ctx.address(),
            ).await?;

            // Update the machine's status
            match &machine.get_data()?.status {
                MachineStatus::Printing(Printing {
                    task_id,
                    paused: false,
                    ..
                }) if task_id == &task.id => {
                    info!("Print #{} Completed!", task.id);
                    // Check if a new task was started (eg. by automatic printing)
                    let next_task = Task::tasks_running_on_machine(
                        db,
                        &machine.id
                    )
                        .await?
                        .into_iter()
                        .filter(|t| t.is_print())
                        .next();

                    machine.get_data()?.status = if let Some(next_task) = next_task {
                        MachineStatus::Printing(Printing {
                            task_id: next_task.id,
                            paused: next_task.status.is_paused(),
                            paused_state: None,
                        })
                    } else {
                        MachineStatus::Ready
                    }
                }
                _ => ()
            };
        } else {
            task.update(db).await?;
        }

        // Notify listeners
        if status_changed && task.status.is_settled() {
            // publish TaskSettled event
            let mut broker = xactor::Broker::from_registry().await?;
            broker.publish(TaskSettled {
                task_id: task.id.clone(),
                task_status: task.status.clone(),
            })?;
        }

        if
            status_changed
            && (task.status.is_settled() || task.status.is_paused())
        {
            machine.send_message(DeleteTaskHistory {
                task_id: task.id,
            }.into()).await?;
        }
    }

    let is_blocking = feedback.heaters.iter().any(|h| h.blocking);

    // Update the amount of time the pending tasks has been blocked for
    if let Some(blocked_at) = machine.data
        .as_ref()
        .and_then(|m| m.blocked_at)
    {
        if !is_blocking {
            let pending_tasks = Task::tasks_running_on_machine(db, &machine.id)
                .await?;

            for mut task in pending_tasks.into_iter() {
                if task.status.is_paused() {
                    continue
                }
                task.time_blocked += (Utc::now() - blocked_at).to_std()?;
                task.update(db).await?;
            }
        }
    }

    // Update the time at which the machine started the current blocking GCode
    if is_blocking && machine.get_data()?.blocked_at == None {
        machine.get_data()?.blocked_at = Some(Utc::now());
    }
    if !is_blocking && machine.get_data()?.blocked_at.is_some() {
        machine.get_data()?.blocked_at = None;
    }

    Ok(())
}

pub async fn update_heaters(
    machine: &mut MachineData,
    feedback: &Feedback,
    now: &DateTime<Utc>,
) -> Result<()> {
    for h in feedback.heaters.iter() {
        let heater = machine.config.get_heater_mut(&h.address);

        let heater = if let Some(heater) = heater {
            heater
        } else {
            warn!("Heater not found: {}", h.address);
            continue
        };

        let history = &mut heater.history;

        // record a data point once every half second
        if
            history.back()
                .map(|last|
                    *now > last.created_at + Duration::milliseconds(500)
                )
                .unwrap_or(true)
        {
            history.push_back(
                TemperatureHistoryEntry {
                    target_temperature: Some(h.target_temperature),
                    actual_temperature: Some(h.actual_temperature),
                    ..TemperatureHistoryEntry::new()
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

pub async fn update_axes(machine: &mut MachineData, feedback: &Feedback) -> Result<()> {
    let axes = &mut machine.config.axes;
    let toolheads = &mut machine.config.toolheads;

    for a in feedback.axes.iter() {
        let axis = axes.iter_mut()
            .find(|c| c.model.address == a.address)
            .map(|c| &mut c.ephemeral);

        let axis = axis.or_else(|| {
            toolheads
                .iter_mut()
                .find(|c| c.model.address == a.address)
                .map(|c| &mut c.ephemeral.axis)
        });

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

pub async fn update_speed_controllers(machine: &mut MachineData, feedback: &Feedback) -> Result<()> {
    let speed_controllers = &mut machine.config.speed_controllers;

    for sc in feedback.speed_controllers.iter() {
        let sc_eph = speed_controllers.iter_mut()
            .find(|c| c.model.address == sc.address)
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

pub async fn update_machine(
    db: &crate::Db,
    machine: &mut Machine,
    feedback: &Feedback,
    now: &DateTime<Utc>,
    ctx: &mut xactor::Context<Machine>,
) -> Result<()> {
    trace!("Feedback status: {:?}", feedback.status);
    // Update machine status
    let next_status = match feedback.status {
        i if i == Status::Errored as i32 && feedback.error.is_some() => {
            let message = feedback.error.as_ref().unwrap().message.clone();
            MachineStatus::Errored(Errored {
                errored_at: now.clone(),
                message,
            })
        }
        i if i == Status::Estopped as i32 => MachineStatus::Stopped,
        i if i == Status::Disconnected as i32 => MachineStatus::Disconnected,
        i if i == Status::Connecting as i32 => MachineStatus::Connecting,
        i if i == Status::Ready as i32 => MachineStatus::Ready,
        i => Err(eyre!("Invalid machine status: {:?}", i))?,
    };

    let machine_data = machine.get_data()?;

    // If the machine has been stopped, disconnected, or encountered an error
    if
        next_status != machine_data.status
        && !next_status.is_driver_ready()
    {
        // Error any tasks not explicitly stopped by task-level Feedback
        //
        // The driver was not aware of these tasks when it sent the feedback so they are moved
        // to an errored state.
        let tasks = Task::tasks_running_on_machine(
            db,
            &machine_data.config.id,
        ).await?;

        let err = match &next_status {
            MachineStatus::Errored(err) => err.clone(),
            _ => Errored {
                errored_at: now.clone(),
                message: "Task desync. Task not found in driver responses".to_string(),
            }
        };

        for mut task in tasks {
            task.status = TaskStatus::Errored(err.clone());

            let tx = db.begin().await?;
            let machine_hooks = machine.hooks.clone();

            task.settle_task(
                tx,
                &machine_hooks,
                machine.data_ref()?,
                &ctx.address(),
            ).await?;
        }
    }

    let machine_data = machine.get_data()?;

    // Do not reset the machine status to ready while it is printing
    if
        machine_data.status != next_status &&
        !(machine_data.status.is_printing() && next_status == MachineStatus::Ready)
    {
        info!("Printer status changed from {:?} to {:?}", machine_data.status, next_status);
        machine_data.status = next_status;
    }

    // Parse the machine flags bitfield
    if let Some(flags) = MachineFlags::from_bits(feedback.machine_flags) {
        // trace!("Machine flags: {:#b}", flags);
        machine_data.absolute_positioning = flags.contains(MachineFlags::ABSOLUTE_POSITIONING);

        machine_data.positioning_units = if flags.contains(MachineFlags::MILLIMETERS) {
            PositioningUnits::Millimeters
        } else {
            PositioningUnits::Inches
        };

        machine_data.motors_enabled = flags.contains(MachineFlags::MOTORS_ENABLED);

        // After pausing a print the driver will send the PAUSED_STATE flag to indicate the state
        // of the machine at the time the print was paused.
        if flags.contains(MachineFlags::PAUSED_STATE) {
            let paused_state = MachineData {
                gcode_history: Default::default(),
                ..machine_data.clone()
            };

            if let MachineStatus::Printing(
                printing @ Printing { paused: true, paused_state: None, .. }
            ) = &mut machine_data.status {
                info!("Paused state set");
                // Copy the machine data to the paused state
                printing.paused_state = Some(Box::new(paused_state))
            } else {
                warn!("PAUSED_STATE flag received but machine is not waiting to set paused_state");
            }
        }
    } else {
        warn!("Unable to parse machine flags: {:#b}", feedback.machine_flags);
    }

    // Update GCode History
    let history = &mut machine.get_data()?.gcode_history;

    for entry in feedback.gcode_history.iter() {
        let direction = if
            entry.direction == machine_message::GCodeHistoryDirection::Rx as i32
        {
            GCodeHistoryDirection::Rx
        } else {
            GCodeHistoryDirection::Tx
        };

        history.push_back(
            GCodeHistoryEntry::new(
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
