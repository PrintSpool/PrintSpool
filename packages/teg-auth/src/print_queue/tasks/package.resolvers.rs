use chrono::prelude::*;
use async_graphql::*;

use super::models::{
    Package,
    Task,
    // TaskStatus,
};

// type Job {
//     id: ID!
//     name: String!
//     quantity: Int!
//     files: [JobFile]!
//     tasks: [Task]!
//     history: [JobHistoryEvent]!
//     printsCompleted: Int!
//     totalPrints: Int!
//     isDone: Boolean!
//     createdAt: String!
//     startedAt: String
//     stoppedAt: String
//   }
  
/// A spooled set of gcodes to be executed by the machine
#[Object]
impl Package {
    async fn id(&self) -> ID { self.id.to_string().into() }
    async fn name(&self) -> &String { &self.name }
    async fn quantity(&self) -> u64 { self.quantity }

    // TODO: various fields

    // async fn files(&self) -> Vec<Part> { vec![] }
    async fn tasks(&self) -> Vec<Task> { vec![] }

    async fn prints_completed(&self) -> u64 { 0u64 }
    async fn total_prints(&self) -> u64 { 0u64 }
    async fn is_done(&self) -> bool { false }

    // Timestamps

    async fn created_at(&self) -> &DateTime<Utc> { &self.created_at }

    // async fn started_at(&self) -> &DateTime<Utc> {
    //     // TODO
    // }

    // async fn stopped_at(&self) -> &DateTime<Utc> {
    //     // TODO
    // }
}
