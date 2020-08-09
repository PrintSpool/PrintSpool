// Package Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Package {
  pub id: ID,
  // Foreign Keys
  pub print_queue_id: ID, // print queues have many packages
  // Timestamps
  #[new(value = "Utc::now()")]
  pub created_at: DateTime<Utc>,
  // Props
  pub name: String,
  pub quantity: u32,
  pub position: u32,
  pub delete_files_after_print: bool,
}
