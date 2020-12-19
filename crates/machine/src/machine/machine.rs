use xactor::Actor;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::sync::Arc;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::models::MachineStatus;
use super::models::GCodeHistoryEntry;
use crate::config::MachineConfig;

#[derive(Default, Debug, Clone)]
pub struct Machine {
    pub db: Arc<sqlx::sqlite::SqlitePool>,
    pub data: MachineData,
}

#[derive(Default, Debug, Clone)]
pub struct MachineData {
    // Config-driven data and ephemeral component data
    pub config: MachineConfig,
    // Top-level ephemeral machine data
    pub status: MachineStatus,
    pub motors_enabled: bool,
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
}

impl Actor for Machine {}
