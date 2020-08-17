// use async_std::prelude::*;
use futures::future::{self, Either};
use async_std::os::unix::net::UnixStream;

use std::sync::Arc;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
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
    let mut machine_subscriber = machine.watch(&ctx.db)?;
    let mut task_subscriber = Task::watch_all(&ctx.db);

    let mut spooled_task_keys = vec![];

    loop {
        use sled::Event;
        use std::convert::TryInto;

        // let event = (&mut subscriber).await;

        let event = future::select(
            &mut machine_subscriber,
            &mut task_subscriber,
        ).await;

        match event {
            // Machine Stops and Resets
            Either::Left((Some(Event::Insert{ value, .. }), _)) => {
                let next_machine: Machine = value.try_into()?;

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

                machine = next_machine;
            },
            // Exit gracefully upon deletion of the machine
            Either::Left((Some(Event::Remove { .. }), _)) => {
                return Ok(())
            },
            // Task inserts
            Either::Right((Some(Event::Insert{ value, .. }), _)) => {
                info!("Task Inserted");

                let task: Task = value.try_into()?;

                // Spool new tasks to the driver
                if
                    task.machine_id == machine.id
                    && !task.sent_to_machine
                    && task.status == TaskStatus::Spooled
                {
                    spooled_task_keys.push(Task::key(task.id)?);

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
            Either::Right((Some(Event::Remove { key }), _)) => {
                let deleted_spooled_task = spooled_task_keys.iter().any(|k|
                    k[..] == key[..]
                );

                if deleted_spooled_task {
                    machine = Machine::stop(&ctx.db, machine.id)?
                }
            }
            _ => ()
        }
    }
}

