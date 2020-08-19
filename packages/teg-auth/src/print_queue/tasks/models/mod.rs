use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod print_queue_r1;
pub use print_queue_r1::PrintQueue;

mod package_r1;
pub use package_r1::Package;

mod part_r1;
pub use part_r1::Part;

mod task;
pub use task::task_r1::{
    self,
    Task,
    Print,
    TaskContent,
    GCodeAnnotation,
};

pub use task::TaskStatus;

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum PrintQueueDBEntry {
    R1 (print_queue_r1::PrintQueue),
}

impl crate::models::VersionedModel for PrintQueue {
    type Entry = PrintQueueDBEntry;
    const NAMESPACE: &'static str = "Package";

    fn get_id(&self) -> u64 {
        self.id
    }
}

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum PackageDBEntry {
    R1 (package_r1::Package),
}

impl crate::models::VersionedModel for Package {
    type Entry = PackageDBEntry;
    const NAMESPACE: &'static str = "Package";

    fn get_id(&self) -> u64 {
        self.id
    }
}

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum PartDBEntry {
    R1 (part_r1::Part),
}

impl crate::models::VersionedModel for Part {
    type Entry = PartDBEntry;
    const NAMESPACE: &'static str = "Part";

    fn get_id(&self) -> u64 {
        self.id
    }
}

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum TaskDBEntry {
    R1 (task_r1::Task),
}

impl crate::models::VersionedModel for Task {
    type Entry = TaskDBEntry;
    const NAMESPACE: &'static str = "Task";

    fn get_id(&self) -> u64 {
        self.id
    }
}
