// Package Revison 1 (LATEST)
// use chrono::prelude::*;
// use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::Arc;
use xactor::{
    Actor,
};


// use crate::models::versioned_model::{
//     VersionedModel,
//     ScopedTree,
// };
use super::GCodeHistoryEntry;

// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };

mod record_feedback;
pub use record_feedback::RecordFeedback;

#[derive(new, Debug, Clone)]
pub struct EphemeralMachineData {
    pub id: crate::DbId,
    pub db: Arc<sled::Db>,
    #[new(default)]
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
}

impl Actor for EphemeralMachineData {}
