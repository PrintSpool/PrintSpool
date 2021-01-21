use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::{Record, UnsavedRecord};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct PrintTask {
    #[new(value = "nanoid!()")]
    pub id: crate::DbId,
    #[new(default)]
    pub version: i32,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub print_id: crate::DbId, // prints have many (>=0) print_tasks
    pub part_id: crate::DbId, // parts have many (>=0) print_tasks
    pub task_id: crate::DbId, // print_tasks have one task
    // Props
    pub estimated_print_time: Option<std::time::Duration>,
    pub estimated_filament_meters: Option<f64>,
}

impl Record for PrintTask {
    const TABLE: &'static str = "print_tasks";

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
impl UnsavedRecord<PrintTask> for PrintTask {}
