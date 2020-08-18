// use async_std::prelude::*;
use std::sync::Arc;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
// use bytes::BufMut;

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
    // TaskStatus,
    // TaskContent,
    Part,
    Package,
};
use crate::machine::models::{
    Machine,
    MachineStatus,
    // Printing,
};

pub async fn run_print_completion_loop(
    ctx: Arc<crate::Context>,
) -> Result<()> {
    let mut task_subscriber = Task::watch_all(&ctx.db);

    let mut spooled_print_key = None;

    loop {
        use sled::Event;
        use std::convert::TryInto;

        // let event = (&mut subscriber).await;

        let event = (&mut task_subscriber).await;

        match event {
            // Task inserts
            Some(Event::Insert{ key, value }) => {
                let task: Task = (*value).try_into()?;

                if task.is_print() && task.status.is_pending() && spooled_print_key.is_none() {
                    spooled_print_key = Some(key.clone());
                }

                if task.status.is_settled() && spooled_print_key == Some(key.clone()) {
                    spooled_print_key = None;

                    let config = ctx.machine_config.read().await;

                    let core_plugin = config.plugins.iter()
                        .find(|plugin| plugin.package == "@tegapp/core")
                        .ok_or_else(|| anyhow!("Could not find @tegapp/core plugin config"))?;

                    let automatic_printing = core_plugin.model["automaticPrinting"]
                        .as_bool()
                        .unwrap_or(false);

                    if task.status.was_successful() {
                        handle_task_completion(
                            &ctx,
                            automatic_printing,
                            task.machine_id,
                            task.id,
                        ).await?;
                    }
                }
            }
            Some(Event::Remove { key }) => {
                let is_spooled_key = spooled_print_key
                    .as_ref()
                    .map(|k| k == &key)
                    .unwrap_or(false);
                if is_spooled_key {
                    spooled_print_key = None;
                }
            }
            _ => {}
        }
    }
}

async fn handle_task_completion(
    ctx: &Arc<crate::Context>,
    automatic_printing: bool,
    machine_id: u64,
    task_id: u64
) -> Result<()> {
    let next_part = if automatic_printing {
        // Get the next part. Yeeaah it's a mess.
        Part::scan(&ctx.db)
            .filter(|part| {
                part
                    .as_ref()
                    .map(|part| {
                        Package::get(
                            &ctx.db,
                            part.package_id
                        ).map(|package|
                            // TODO: which parts can be printed on this machine?
                            // part.print_queue_id == print_queue_id
                            part.printed < part.total_prints(&package)
                        ).unwrap_or(true)
                    })
                    .unwrap_or(true)
            })
            .collect::<Result<Vec<Part>>>()?
            .into_iter()
            .min_by_key(|part| part.position)
    } else {
        None
    };

    if let Some(next_part) = next_part {
        // Start the print
        Task::insert_print(&ctx, machine_id, next_part.id).await?;
    } else {
        // Reset the machine status to ready if there are no more parts to print
        Machine::set_status(&ctx.db, machine_id, |machine| {
            if machine.status.is_printing_task(task_id) {
                MachineStatus::Ready
            } else {
                machine.status.clone()
            }
        })?;
    }

    Ok(())
}
