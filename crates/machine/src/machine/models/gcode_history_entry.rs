use chrono::prelude::*;

#[derive(async_graphql::SimpleObject, new, Debug, Clone)]
pub struct GCodeHistoryEntry {
    pub id: u32,
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Props
    content: String,
    direction: GCodeHistoryDirection,
}

#[derive(async_graphql::Enum, Debug, Copy, Clone, Eq, PartialEq)]
pub enum GCodeHistoryDirection {
    #[graphql(name="RX")]
    Rx,
    #[graphql(name="TX")]
    Tx,
}
