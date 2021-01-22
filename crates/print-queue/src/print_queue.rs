use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::Record;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrintQueue {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    // Props
}

#[async_trait::async_trait]
impl Record for PrintQueue {
    const TABLE: &'static str = "print_queues";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> teg_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut teg_json_store::Version {
        &mut self.version
    }
}
