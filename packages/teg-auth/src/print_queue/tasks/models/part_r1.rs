// Part Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Part {
  pub id: ID,
  // Foreign Keys
  pub print_queue_id: ID, // print queues have many packages
  pub package_id: ID, // packages have many (>=1) parts
  // Timestamps
  #[new(value = "Utc::now()")]
  pub created_at: DateTime<Utc>,
  // Props
  pub name: String,
  pub quantity: u32,
  pub position: u32,
  pub file_path: String,
}
