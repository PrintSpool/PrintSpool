// Task Revison 1 (LATEST)
use chrono::prelude::*;
// use async_graphql::ID;
use serde::{Deserialize, Serialize};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Print {
    // Foreign Keys
    pub print_queue_id: crate::DbId, // print queues have many (>=0) parts
    pub package_id: crate::DbId, // packages have many (>=1) parts
    pub part_id: crate::DbId, // parts have many (>=0) tasks
    pub task_id: crate::DbId,
    // Props
    pub estimated_print_time: Option<std::time::Duration>,
    pub estimated_filament_meters: Option<f64>,
}
