use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod task_r1;
pub use task_r1::*;

// mod Task_r2;
// pub use Task_r2::TaskR2;

// mod Task_r3;
// pub use Task_r3::TaskR3;

pub type Task = TaskR1;

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum TaskDBEntry {
    TaskR1 (TaskR1),
    // TaskR2 (TaskR2),
    // TaskR3 (TaskR3),
}

impl crate::models::VersionedModel for Task {
    type Entry = TaskDBEntry;
    const NAMESPACE: &'static str = "Task";

    fn get_id(&self) -> &async_graphql::ID {
        &self.id
    }
}
