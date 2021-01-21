use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::{Record, UnsavedRecord};
// use anyhow::{
//   anyhow,
//   Result,
//   // Context as _,
// };

use crate::package::Package;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Part {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub print_queue_id: crate::DbId, // print queues have many (>=0) parts
    pub package_id: crate::DbId, // packages have many (>=1) parts
    // Props
    pub name: String,

    pub quantity: u64,
    pub printed: u64,
    pub position: u64,
    pub file_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedPart {
    // Foreign Keys
    pub print_queue_id: crate::DbId, // print queues have many (>=0) parts
    pub package_id: crate::DbId, // packages have many (>=1) parts
    // Props
    pub name: String,

    // #[new(value = "1")]
    pub quantity: u64,
    // #[new(default)]
    pub printed: u64,
    pub position: u64,
    pub file_path: String,
}

impl Part {
    pub fn total_prints(&self, package: &Package) -> u64 {
        self.quantity * package.quantity
    }

    pub fn is_done(&self, package: &Package) -> bool {
        self.printed >= self.total_prints(package)
    }
}

impl Record for Part {
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
impl UnsavedRecord<Part> for UnsavedPart {}
