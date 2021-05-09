// // use async_std::prelude::*;
// use async_std::fs;

// use std::sync::Arc;
// use eyre::{
//     eyre,
//     Result,
//     // Context as _,
// };
// // use bytes::BufMut;
// use futures::stream::{StreamExt};

// use crate::models::VersionedModel;
// use crate::print_queue::tasks::{
//     Task,
//     // TaskStatus,
//     TaskContent,
//     Part,
//     Package,
// };
// use crate::machine::models::{
//     Machine,
//     MachineStatus,
//     // Printing,
// };

// pub async fn run_print_completion_loop(
//     ctx: Arc<crate::Context>,
// ) -> Result<()> {
//     let mut task_changes = Task::watch_all_changes(&ctx.db)?;

//     loop {
//         use crate::models::versioned_model::Change;

//         let change = task_changes.next().await
//             .ok_or_else(|| eyre!("print loop task stream unexpectedly ended"))??;

//         let was_pending = change.previous
//             .as_ref()
//             .map(|t| t.status.is_pending())
//             .unwrap_or(true);

//         match change {
//             // Handle settled tasks
//             Change { next: Some(task), .. } if was_pending && task.status.is_settled() => {
//                 if task.is_print() && task.status.was_successful() {
//                     let config = ctx.machine_config.load();

//                     let automatic_printing = config.core_plugin()?.model.automatic_printing;

//                     handle_print_completion(
//                         &ctx,
//                         automatic_printing,
//                         &task,
//                     ).await?;
//                 }

//                 // Delete the settled task
//                 Task::remove(&ctx.db, task.id)?;

//                 ctx.db.flush_async().await?;
//             }
//             Change { previous: Some(task), next: None, .. } => {
//                 // clean up files on task deletion
//                 if let TaskContent::FilePath(file_path) = task.content {
//                     fs::remove_file(file_path).await?;
//                 }
//             }
//             _ => {}
//         }
//     }
// }

// async fn handle_print_completion(
//     ctx: &Arc<crate::Context>,
//     automatic_printing: bool,
//     task: &Task,
// ) -> Result<()> {
//     let print = task.print.as_ref().ok_or_else(||
//         eyre!("Missing print for task: {}", task.id)
//     )?;

//     // Parts printed update
//     Part::get_and_update(&ctx.db, print.part_id, |mut part| {
//         part.printed += 1;
//         part
//     })?;

//     // Parts + Package deletion
//     let package = Package::find(&ctx.db, |package| {
//         package.id == print.package_id
//     })?;

//     let parts = Part::filter(&ctx.db, |part| {
//         part.package_id == print.package_id
//     })?;

//     if package.started_final_print(&parts) {
//         Package::remove(&ctx.db, package.id)?;
//         for part in parts {
//             Part::remove(&ctx.db, part.id)?;
//         }
//     }


//     Ok(())
// }
