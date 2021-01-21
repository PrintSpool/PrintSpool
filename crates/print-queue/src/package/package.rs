use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::{Record, UnsavedRecord};

use crate::part::Part;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Package {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Props
    pub name: String,
    pub quantity: u64,
    // #[new(value = "true")]
    // pub delete_files_after_print: bool,
    // Indexes
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedPackage {
    pub name: String,
    pub quantity: u64,
    // #[new(value = "true")]
    // pub delete_files_after_print: bool,
    // Indexes
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

impl Record for Package {
    const TABLE: &'static str = "tasks";

    fn id(&self) -> crate::DbId {
        self.id
    }

    fn version(&self) -> crate::DbId {
        self.version
    }

    fn version_mut(&mut self) -> &mut crate::DbId {
        &mut self.version
    }
}

#[async_trait::async_trait]
impl UnsavedRecord<Package> for UnsavedPackage {}
