use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod task_r1;
pub use task_r1::{
    TaskR1 as Task,
    TaskR1Builder as TaskBuilder,
    TaskContentR1 as TaskContent,
    GCodeAnnotationR1 as GCodeAnnotation,
};

mod task_status_r1;
pub use task_status_r1::{
    TaskStatusR1 as TaskStatus,
};

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum TaskDBEntry {
    TaskR1 (task_r1::TaskR1),
    // TaskR2 (task_r2::TaskR2),
    // TaskR3 (task_r3::TaskR3),
}

impl crate::models::VersionedModel for Task {
    type Entry = TaskDBEntry;
    const NAMESPACE: &'static str = "Task";

    fn get_id(&self) -> &async_graphql::ID {
        &self.id
    }
}
