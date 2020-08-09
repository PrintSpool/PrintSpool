use chrono::prelude::*;
use async_graphql::*;

use super::models::{
    Task,
    TaskStatus,
};

/// A spooled set of gcodes to be executed by the machine
#[Object]
impl Task {
    async fn id(&self) -> &ID { &self.id }
    async fn status(&self) -> &TaskStatus { &self.status }
    // TODO: rename
    async fn total_line_numbers(&self) -> &u64 { &self.total_lines }
    // TODO: rename
    async fn current_line_number(&self) -> &Option<u64> { &self.despooled_line_number }

    async fn percent_complete(&self) -> f32 {
        ((self.despooled_line_number.map(|n| n + 1).unwrap_or(0)) / self.total_lines) as f32
    }

    // async fn machine(&self) -> &Machine {
    //     // TODO
    // }

    // // Timestamps

    async fn created_at(&self) -> &DateTime<Utc> { &self.created_at }

    // async fn started_at(&self) -> &DateTime<Utc> {
    //     // TODO
    // }

    // async fn stopped_at(&self) -> &DateTime<Utc> {
    //     // TODO
    // }
}
