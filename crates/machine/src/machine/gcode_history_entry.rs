use std::sync::atomic::{ AtomicU64, Ordering };
use chrono::prelude::*;

static NEXT_ID: AtomicU64 = AtomicU64::new(0);

#[derive(async_graphql::SimpleObject, new, Debug, Clone)]
pub struct GCodeHistoryEntry {
    #[new(value = "NEXT_ID.fetch_add(1, Ordering::SeqCst).into()")]
    pub id: async_graphql::ID,
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
