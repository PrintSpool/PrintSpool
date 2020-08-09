use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

use super::task_status_r1::TaskStatusR1;

#[derive(Builder, Debug, Serialize, Deserialize, Clone)]
#[builder(setter(into))]
pub struct TaskR1 {
  pub id: ID,
  // Foreign Keys
  pub machine_id: ID, // machines have many (>=0) tasks
  pub package_id: Option<ID>, // packages have many (>=1) parts
  pub part_id: Option<ID>, // parts have many (>=0) tasks
  // Timestamps
  pub created_at: DateTime<Utc>,
  // Content
  pub content: TaskContentR1,
  // Props
  pub name: String,
  pub annotations: Vec<(u64, GCodeAnnotationR1)>,
  pub total_lines: u64,
  pub despooled_line_number: Option<u64>,
  pub machine_override: bool,
  pub status: TaskStatusR1,
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
