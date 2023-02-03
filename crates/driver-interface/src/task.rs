use crate::{
    machine::{Machine, MachineHooksList},
    Db, DbId, Deletion,
};
use async_graphql::futures_util::future::try_join_all;
use eyre::Result;
use printspool_proc_macros::printspool_collection;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tracing::warn;

mod gcode_annotation;
mod task_indexes;
mod task_resolvers;
mod task_status;
mod task_status_key;

pub use self::task_status_key::TaskStatusKey;
pub use gcode_annotation::GCodeAnnotation;
pub use task_indexes::*;
pub use task_status::{Cancelled, Created, Errored, Finished, Paused, TaskStatus};

#[printspool_collection(sort_key = |t| -> TaskStatusKey { t.status.into() })]
pub struct Task {
    // Foreign Keys
    #[printspool(foreign_key)]
    pub machine_id: DbId<Machine>, // machines have many (>=0) tasks
    #[printspool(foreign_key)]
    pub part_id: Option<DbId<TaskPartFk>>, // parts have many (>=0) print tasks
    #[printspool(foreign_key)]
    pub package_id: Option<DbId<TaskPackageFk>>, // print queues have many (>=0) print tasks
    #[printspool(foreign_key)]
    pub print_queue_id: Option<DbId<TaskPrintQueueFk>>, // print queues have many (>=0) print tasks
    // Content
    pub content: TaskContent,
    // Props
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    pub despooled_line_number: Option<u64>,
    pub machine_override: bool,
    pub estimated_print_time: Option<std::time::Duration>,

    #[serde(default)]
    /// The amount of time the task spent waiting on blocking GCodes eg. heating up the extruder.
    pub time_blocked: std::time::Duration,
    /// The amount of time the task was previously paused for. If the task is currently paused this
    /// excludes the current pause.
    #[serde(default)]
    pub time_paused: std::time::Duration,

    pub estimated_filament_meters: Option<f64>,
    // #[new(default)]
    // pub sent_to_machine: bool,
    #[serde(default)]
    pub status: TaskStatus,
}

/// Task.part_id foreign key
pub struct TaskPartFk;

/// Task.print_queue_id foreign key
pub struct TaskPackageFk;

/// Task.print_queue_id foreign key
pub struct TaskPrintQueueFk;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
    FilePath(PathBuf),
    GCodes(Vec<String>),
}

impl Task {
    pub fn is_print(&self) -> bool {
        self.part_id.is_some()
    }

    pub async fn tasks_running_on_machine(
        db: &Db,
        machine_id: &DbId<Machine>,
    ) -> Result<Vec<Self>> {
        let tasks = TasksByMachine::entries(&db)
            .with_keys(
                TaskStatusKey::PENDING
                    .iter()
                    .map(|status| (Deletion::None, machine_id, status)),
            )
            .query_with_collection_docs()
            .await?
            .into_iter()
            .map(|m| m.document.contents)
            .collect();

        Ok(tasks)
    }

    pub async fn settle_task<'c>(
        &mut self,
        db: &Db,
        machine: &mut Machine,
        machine_hooks: &MachineHooksList,
    ) -> Result<()> {
        // Move the despooled line number to the end of the file if the print was successful
        if self.status.was_successful() {
            // Accounting for zero length tasks
            let total_lines = std::cmp::max(self.total_lines, 1);

            self.despooled_line_number = Some(total_lines - 1);
        }

        // Replace the completed GCodes with an empty vec to save space
        let content = std::mem::replace(&mut self.content, TaskContent::GCodes(vec![]));

        // Run hooks
        try_join_all(machine_hooks.iter().map(|machine_hook| async move {
            machine_hook
                .before_task_settle(db, &mut machine, machine_hooks, &mut self)
                .await
        }))
        .await?;

        if let TaskContent::FilePath(file_path) = content {
            if let Err(err) = tokio::fs::remove_file(&file_path).await {
                warn!(
                    "Unable to remove completed GCode file ({:?}): {:?}",
                    file_path, err
                );
            }
        }

        self.update(&db).await?;

        // Run hooks
        try_join_all(machine_hooks.iter().map(|machine_hook| async move {
            machine_hook
                .after_task_settle(db, &mut machine, machine_hooks, &mut self)
                .await
        }))
        .await?;

        Ok(())
    }
}
