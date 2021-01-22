use chrono::prelude::*;
use serde::{Deserialize, Serialize};
// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };
use teg_json_store::Record;

use super::{
    GCodeAnnotation,
    TaskStatus,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub machine_id: crate::DbId, // machines have many (>=0) tasks
    // Content
    pub content: TaskContent,
    // Props
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    pub despooled_line_number: Option<u64>,
    pub machine_override: bool,
    // #[new(default)]
    // pub sent_to_machine: bool,
    #[serde(default)]
    pub status: TaskStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
    FilePath(String),
    GCodes(Vec<String>),
}

impl Record for Task {
    const TABLE: &'static str = "tasks";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> teg_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut teg_json_store::Version {
        &mut self.version
    }
}
