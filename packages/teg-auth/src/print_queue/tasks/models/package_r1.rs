// Package Revison 1 (LATEST)
use chrono::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Package {
  pub id: u64,
  // Timestamps
  #[new(value = "Utc::now()")]
  pub created_at: DateTime<Utc>,
  // Props
  pub name: String,
  #[new(value = "1")]
  pub quantity: u64,
  // #[new(value = "true")]
  // pub delete_files_after_print: bool,
  // Indexes
  #[new(default)]
  pub part_ids: Vec<u64>,
}
