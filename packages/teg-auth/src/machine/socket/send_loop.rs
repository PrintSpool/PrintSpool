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

    loop {
        use sled::Event;
        use std::convert::TryInto;

        // let event = (&mut subscriber).await;

        let event = future::select(
            &mut machine_subscriber,
            &mut task_subscriber,
        ).await;

        match event {
            Either::Left((Some(Event::Insert{ value, .. }), _)) => {
                let next_machine: Machine = value.try_into()?;

                if next_machine.stop_counter > machine.stop_counter {
                    send_message(&mut stream, stop_machine())
                        .await?;
                }
                if next_machine.reset_counter > machine.reset_counter {
                    send_message(&mut stream, reset_machine())
                        .await?;
                }

                machine = next_machine;
            },
            Either::Left((Some(Event::Remove { .. }), _)) => {
                // exit gracefully upon deletion of the machine
                return Ok(())
            },
            Either::Right((Some(Event::Insert{ value, .. }), _)) => {
                info!("Task Inserted");

                let task: Task = value.try_into()?;

                if
                    task.machine_id == machine.id
                    && !task.sent_to_machine
                    && task.status == TaskStatus::Spooled
                {
                    send_message(&mut stream, spool_task(client_id, &task)?)
                        .await?;

                    Task::fetch_and_update(
                        &ctx.db,
                        task.id,
                        |task| task.map(|mut task| {
                            task.sent_to_machine = true;
                            task
                        }),
                    )?;
                }
            }
            _ => ()
        }
    }
}

