// Task Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

use super::task_status_r1::TaskStatus;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Task {
  pub id: ID,
  // Foreign Keys
  pub machine_id: ID, // machines have many (>=0) tasks
  #[new(default)]
  pub print: Option<Print>,
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
  #[new(default)]
  pub sent_to_machine: bool,
  #[new(default)]
  pub status: TaskStatus,
  #[new(default)]
  pub error_message: Option<String>,
}

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Print {
  pub print_queue_id: ID, // print queues have many packages
  pub package_id: ID, // packages have many (>=1) parts
  pub part_id: ID, // parts have many (>=0) tasks
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
  FilePath(String),
  GCodes(Vec<String>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum GCodeAnnotation {
  SetToolheadMaterials()
}

impl Task {
  pub fn is_print(&self) -> bool {
    self.print.is_some()
  }
}
