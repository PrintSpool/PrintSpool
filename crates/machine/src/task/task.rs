use chrono::prelude::*;
use serde::{Deserialize, Serialize};
// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };
use teg_json_store::{Record, UnsavedRecord};

use super::{
    GCodeAnnotation,
    TaskStatus,
};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: crate::DbId,
    pub version: crate::DbId,
    // Foreign Keys
    pub machine_id: crate::DbId, // machines have many (>=0) tasks
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Content
    pub content: TaskContent,
    // Props
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    #[new(default)]
    pub despooled_line_number: Option<u64>,
    #[new(default)]
    pub machine_override: bool,
    // #[new(default)]
    // pub sent_to_machine: bool,
    #[new(default)]
    pub status: TaskStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
    FilePath(String),
    GCodes(Vec<String>),
}

#[derive(Debug, Clone)]
pub enum AnyTask {
    Saved(Task),
    Unsaved(UnsavedTask),
}

impl AnyTask {
    pub fn machine_override(&self) -> bool {
        match self {
            AnyTask::Saved(task) => task.machine_override,
            AnyTask::Unsaved(task) => task.machine_override,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedTask {
    pub machine_id: crate::DbId, // machines have many (>=0) tasks
    // Content
    pub content: TaskContent,
    // Props
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    pub machine_override: bool,
}


impl Record for Task {
    const TABLE: &'static str = "tasks";

    fn id(&self) -> crate::DbId {
        self.id
    }

    fn version(&self) -> crate::DbId {
        self.version
    }

    fn version_mut(&mut self) -> &mut crate::DbId {
        &mut self.version
    }
}

#[async_trait::async_trait]
impl UnsavedRecord<Task> for UnsavedTask {}
