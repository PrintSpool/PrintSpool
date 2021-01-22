use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::Record;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct PrintTask {
    #[new(value = "nanoid!()")]
    pub id: crate::DbId,
    #[new(default)]
    pub version: i32,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub package_id: crate::DbId, // packages have many (>=0) print_tasks
    pub part_id: crate::DbId, // parts have many (>=0) print_tasks
    pub task_id: crate::DbId, // print_tasks have one task
    // Props
    pub estimated_print_time: Option<std::time::Duration>,
    pub estimated_filament_meters: Option<f64>,
}

impl Record for PrintTask {
    const TABLE: &'static str = "print_tasks";

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
