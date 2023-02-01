use std::path::PathBuf;

use bonsaidb::core::{
    connection::AsyncConnection,
    define_basic_mapped_view, define_basic_unique_mapped_view,
    document::{CollectionDocument, Header},
    schema::{view::map::Mappings, Collection},
    transaction::Transaction,
};
use eyre::Result;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::{machine::Machine, machine::MachineData, Deletion, MachineHooksList};

use super::{GCodeAnnotation, TaskStatus};

#[derive(Debug, Serialize, Deserialize, Clone, Collection)]
#[collection(name = "tasks", views = [TasksById, TasksByMachine, TasksByPart, TasksByPrintQueue])]
pub struct Task {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: OffsetDateTime,
    // Foreign Keys
    pub machine_id: crate::DbId,      // machines have many (>=0) tasks
    pub part_id: Option<crate::DbId>, // parts have many (>=0) print tasks
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
    FilePath(PathBuf),
    GCodes(Vec<String>),
}

define_basic_unique_mapped_view!(
    TasksById,
    Task,
    0,
    "by:id",
    (crate::DbId, TaskStatusGQL),
    |document: CollectionDocument<Task>| {
        let task = document.contents;
        document.header.emit_key((task.id, task.status.into()))
    }
);

define_basic_mapped_view!(
    TasksByMachine,
    Task,
    0,
    "by:machine",
    (crate::DbId, TaskStatusGQL),
    |document: CollectionDocument<Task>| {
        let task = document.contents;
        document
            .header
            .emit_key((task.machine_id, task.status.into()))
    }
);

define_basic_mapped_view!(
    TasksByPart,
    Task,
    0,
    "by:part",
    (crate::DbId, TaskStatusGQL),
    |document: CollectionDocument<Task>| {
        let task = document.contents;
        document
            .header
            .emit_key((task.machine_id, task.status.into()))
    }
);

define_basic_mapped_view!(
    TasksByPrintQueue,
    Task,
    0,
    "by:print_queue|created_at",
    (crate::DbId, OffsetDateTime),
    |document: CollectionDocument<Task>| {
        if let Some(print_queue_id) = document.contents.print_queue_id {
            document
                .header
                .emit_key((print_queue_id, document.contents.created_at))
        } else {
            Ok(Mappings::none())
        }
    }
);

impl Task {
    pub fn is_print(&self) -> bool {
        self.part_id.is_some()
    }

    pub async fn tasks_running_on_machine<DB: AsyncConnection<_>>(
        db: &DB,
        machine_id: &crate::DbId,
    ) -> Result<CollectionDocument<Self>> {
        let keys = [
            TaskStatusGQL::Spooled,
            TaskStatusGQL::Started,
            TaskStatusGQL::Paused,
        ]
        .into_iter()
        .map(|status| (machine_id.clone(), status))
        .collect::<Vec<_>>();

        let tasks = db
            .view::<TasksByMachine>()
            .with_keys(keys.iter())
            .query_with_collection_docs();

        Ok(tasks)
    }

    pub async fn settle_task(
        &mut self,
        header: Header,
        tx: &mut Transaction,
        machine_hooks: &MachineHooksList,
        machine_data: &MachineData,
        machine_addr: &xactor::Addr<Machine>,
    ) -> Result<()> {
        // Move the despooled line number to the end of the file if the print was successful
        if self.status.was_successful() {
            // Accounting for zero length tasks
            let total_lines = std::cmp::max(self.total_lines, 1);

            self.despooled_line_number = Some(total_lines - 1);
        }

        // Replace the completed GCodes with an empty vec to save space
        let content = std::mem::replace(&mut self.content, TaskContent::GCodes(vec![]));

        let mut after_task_settle_cbs = vec![];
        for machine_hook in machine_hooks.iter() {
            let after_settle_cb = machine_hook
                .before_task_settle(
                    &mut tx,
                    machine_hooks,
                    machine_data,
                    machine_addr.clone(),
                    &mut *self,
                )
                .await?;

            if let Some(after_settle_cb) = after_settle_cb {
                after_task_settle_cbs.push(after_settle_cb);
            }
        }

        tx.update(Self, header, self).await?;
        tx.commit().await?;

        // Delete the completed GCode file
        if let TaskContent::FilePath(file_path) = content {
            if let Err(err) = async_std::fs::remove_file(&file_path).await {
                warn!(
                    "Unable to remove completed GCode file ({:?}): {:?}",
                    file_path, err
                );
            }
        }

        for after_settle_cb in after_task_settle_cbs {
            after_settle_cb.await;
        }

        Ok(())
    }
}
