use chrono::prelude::*;
use async_graphql::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskR1 {
  pub id: ID,
  // Foreign Keys
  pub machine_id: ID, // machines have many (>=0) tasks
  pub package_id: ID, // packages have many (>=1) parts
  pub part_id: ID, // parts have many (>=0) tasks
  // Timestamps
  pub created_at: DateTime<Utc>,
  // Props
  pub name: String,
  pub content: TaskContent,
  pub annotations: Vec<(u64, TaskAnnotation)>,
  pub total_lines: u64,
  pub despooled_line_number: Option<u64>,
  pub machine_override: bool,
  pub status: TaskStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
  FilePath(String),
  GCodes(Vec<String>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskAnnotation {
  SetToolheadMaterials()
}

#[Enum]
#[derive(Debug, Serialize, Deserialize)]
pub enum TaskStatus {
  /* Before sending to the driver */
  Spooled,
  /* After sending to the driver */
  Started,
  Finished,
  Paused,
  Cancelled,
  Errored,
}
