use chrono::prelude::*;
use async_graphql::Enum;
use serde::{Deserialize, Serialize};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct GCodeHistoryEntry {
    pub id: u64,
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Props
    content: String,
    direction: GCodeHistoryDirection,
}

#[Enum]
#[derive(Debug, Serialize, Deserialize)]
pub enum GCodeHistoryDirection {
    #[item(name = "RX")]
    Rx,
    #[item(name = "TX")]
    Tx,
}
