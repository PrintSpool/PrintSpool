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
  pub print_queue_id: Option<ID>, // print queues have many packages
  #[new(default)]
  pub package_id: Option<ID>, // packages have many (>=1) parts
  #[new(default)]
  pub part_id: Option<ID>, // parts have many (>=0) tasks
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
  FilePath(String),
  GCodes(Vec<String>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum GCodeAnnotation {
  SetToolheadMaterials()
}
