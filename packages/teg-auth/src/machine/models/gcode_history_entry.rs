// Package Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::Enum;
use serde::{Deserialize, Serialize};
// use std::collections::VecDeque;

// use crate::models::versioned_model::{
//     VersionedModel,
//     ScopedTree,
// };
// use super::machine_status_r1::MachineStatus;

// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct GCodeHistoryEntry {
    pub id: u32,
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
