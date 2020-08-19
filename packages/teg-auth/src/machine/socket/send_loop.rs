// use async_std::prelude::*;
use futures::future::{self, Either};
use futures::stream::{StreamExt};
use async_std::os::unix::net::UnixStream;

use std::sync::Arc;
use anyhow::{
    anyhow,
    Result,
    Context as _,
};
// use bytes::BufMut;

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
    TaskStatus,
    // TaskContent,
};
use crate::machine::models::{
    Machine,
    // MachineStatus,
    // Printing,
};

use super::{
    super::{
        spool_task,
        stop_and_reset:: {
            stop_machine,
            reset_machine,
        },
    },
    send_message,
};

pub async fn run_send_loop(
    client_id: u32,
    ctx: Arc<crate::Context>,
    machine_id: u64,
    mut stream: UnixStream,
) -> Result<()> {
    let mut machine = Machine::get(&ctx.db, machine_id)?;
    let mut machine_events = Machine::watch_id(&ctx.db, machine_id)?;
    let mut task_events = Task::watch_all(&ctx.db);

    let mut spooled_task_keys = vec![];

    loop {
        use crate::models::versioned_model::Event;

        let event = future::select(
            machine_events.next(),
            task_events.next(),
        ).await;

        let event = match event {
            Either::Left((event, _)) => {
                event
                    .ok_or(anyhow!("Machine stream unexpectedly ended"))?
                    .map(|event| Either::Left(event))
                    .with_context(|| "Machine stream error")?
            }
            Either::Right((event, _)) => {
                event
                    .ok_or(anyhow!("Task stream unexpectedly ended"))?
                    .map(|event| Either::Right(event))
                    .with_context(|| "Task stream error")?
            }
        };

        match event {
            // Machine Stops and Resets
            Either::Left(Event::Insert{ value: next_machine, .. }) => {
                // Stop (from GraphQL mutation)
                if next_machine.stop_counter != machine.stop_counter {
                    send_message(&mut stream, stop_machine()).await?;
                    spooled_task_keys.clear();
                }
                // Reset (from GraphQL mutation)
                if next_machine.reset_counter != machine.reset_counter {
                    send_message(&mut stream, reset_machine()).await?;
                }
                // Record all changes in machine state (eg. machine stops) to tasks status
                if
                    machine.status.is_driver_ready()
                    && !next_machine.status.is_driver_ready()
                {
                    spooled_task_keys.clear();
                    for task in Task::scan(&ctx.db) {
                        let task = task?;

                        if task.status.is_pending() {
                            Task::get_and_update(
                                &ctx.db,
                                task.id,
                                |mut task| {
                                    task.status = TaskStatus::Errored;
                                    task
                                }
                            )?;
                        }
                    }
                }

                machine = next_machine.clone();
            },
            // Exit gracefully upon deletion of the machine
            Either::Left(Event::Remove { .. }) => {
                return Ok(())
            },
            // Task inserts
            Either::Right(Event::Insert{ value: task, .. }) => {
                info!("Task Inserted");

                // Spool new tasks to the driver
                if
                    task.machine_id == machine.id
                    && !task.sent_to_machine
                    && task.status == TaskStatus::Spooled
                {
                    spooled_task_keys.push(Task::key(task.id));

                    Task::get_and_update(
                        &ctx.db,
                        task.id,
                        |mut task| {
                            task.sent_to_machine = true;
                            task
                        },
                    )?;

                    send_message(&mut stream, spool_task(client_id, &task)?)
                        .await?;
                }
            }
            // Estop the machine on deletion of a spooled task
            Either::Right(Event::Remove { key }) => {
                let deleted_spooled_task = spooled_task_keys.iter().any(|k|
                    k[..] == key[..]
                );

                if deleted_spooled_task {
                    machine = Machine::stop(&ctx.db, machine.id)?
                }
            }
        }
    }
}

