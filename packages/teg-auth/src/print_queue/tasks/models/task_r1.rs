use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

use super::task_status_r1::TaskStatusR1;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct TaskR1 {
  pub id: ID,
  // Foreign Keys
  pub machine_id: ID, // machines have many (>=0) tasks
  #[new(default)]
  pub print_queue_id: Option<ID>, // print queues have many packages
  #[new(default)]
  pub package_id: Option<ID>, // packages have many (>=1) parts
  #[new(default)]
  pub part_id: Option<ID>, // parts have many (>=0) tasks
  // Timestamps
  #[new(value = "Utc::now()")]
  pub created_at: DateTime<Utc>,
  // Content
  pub content: TaskContentR1,
  // Props
  pub annotations: Vec<(u64, GCodeAnnotationR1)>,
  pub total_lines: u64,
  #[new(default)]
  pub despooled_line_number: Option<u64>,
  #[new(default)]
  pub machine_override: bool,
  #[new(default)]
  pub status: TaskStatusR1,
  #[new(default)]
  pub error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContentR1 {
  FilePath(String),
  GCodes(Vec<String>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum GCodeAnnotationR1 {
  SetToolheadMaterials()
}
