use chrono::prelude::*;
use serde::{Deserialize, Serialize};

use super::Part;

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

impl Package {
  pub fn total_prints(&self, parts: &Vec<Part>) -> u64 {
    self.quantity * parts.iter().map(|part| part.quantity).sum::<u64>()
  }

  pub fn printed(&self, parts: &Vec<Part>) -> u64 {
    parts.iter().map(|part| part.printed).sum()
  }

  pub fn is_done(&self, parts: &Vec<Part>) -> bool {
    parts
      .iter()
      .all(|part| part.is_done(&self))
  }
}
