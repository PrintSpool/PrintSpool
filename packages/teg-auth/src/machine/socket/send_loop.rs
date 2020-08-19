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

use crate::models::versioned_model::{
    VersionedModel,
    Change,
    Event,
};
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
    let mut task_changes = Task::watch_all_changes(&ctx.db)?;

    loop {
        let event = future::select(
            machine_events.next(),
            task_changes.next(),
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
            Either::Left(Event::Insert { value: next_machine, .. }) => {
                // Stop (from GraphQL mutation)
                if next_machine.stop_counter != machine.stop_counter {
                    send_message(&mut stream, stop_machine()).await?;
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
            Either::Right(Change { next: Some(task), .. }) => {
                info!("Task Inserted");

                // Spool new tasks to the driver
                if
                    task.machine_id == machine.id
                    && !task.sent_to_machine
                    && task.status == TaskStatus::Spooled
                {
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
            // Either::Right(Change { previous: Some(task), next: None, .. }) => {
            //     if 
            //         task.id == machine_id &&
            //         task.status.is_pending()
            //     {
            //         machine = Machine::stop(&ctx.db, machine.id)?
            //     }
            // }
            _ => {}
        }
    }
}
