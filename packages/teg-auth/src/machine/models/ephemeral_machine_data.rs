// Package Revison 1 (LATEST)
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

use crate::models::versioned_model::{
    VersionedModel,
    ScopedTree,
};
use super::GCodeHistoryEntry;

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct EphemeralMachineData {
    pub id: u64,
    #[new(default)]
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
}
