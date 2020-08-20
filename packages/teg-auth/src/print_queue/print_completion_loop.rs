// use async_std::prelude::*;
use async_std::fs;

use std::sync::Arc;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
// use bytes::BufMut;
use futures::stream::{StreamExt};

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
    // TaskStatus,
    TaskContent,
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
    let mut task_changes = Task::watch_all_changes(&ctx.db)?;

    loop {
        use crate::models::versioned_model::Change;

        let change = task_changes.next().await
            .ok_or_else(|| anyhow!("print loop task stream unexpectedly ended"))??;

        let was_pending = change.previous
            .as_ref()
            .map(|t| t.status.is_pending())
            .unwrap_or(true);

        match change {
            // Handle settled tasks
            Change { next: Some(task), .. } if was_pending && task.status.is_settled() => {
                if task.is_print() && task.status.was_successful() {
                    let config = ctx.machine_config.load();

                    let core_plugin = config.plugins.iter()
                        .find(|plugin| plugin.package == "@tegapp/core")
                        .ok_or_else(|| anyhow!("Could not find @tegapp/core plugin config"))?;

                    let automatic_printing = core_plugin.model["automaticPrinting"]
                        .as_bool()
                        .unwrap_or(false);

                    handle_print_completion(
                        &ctx,
                        automatic_printing,
                        task.machine_id,
                        task.id,
                    ).await?;
                }

                // Delete the settled task
                Task::remove(&ctx.db, task.id)?;

                ctx.db.flush_async().await?;
            }
            Change { previous: Some(task), next: None, .. } => {
                // clean up files on task deletion
                if let TaskContent::FilePath(file_path) = task.content {
                    fs::remove_file(file_path).await?;
                }
            }
            _ => {}
        }
    }
}

async fn handle_print_completion(
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
