use xactor::Actor;
// use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
// use std::sync::Arc;
use async_std::os::unix::net::UnixStream;
// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };

use super::models::MachineStatus;
use super::models::GCodeHistoryEntry;
use crate::config::MachineConfig;

#[derive(Debug, Clone)]
pub struct Machine {
    pub db: crate::Db,
    pub write_stream: Option<UnixStream>,

    pub data: MachineData,
}

#[derive(Debug, Clone)]
pub struct MachineData {
    // Config-driven data and ephemeral component data
    pub config: MachineConfig,
    // Top-level ephemeral machine data
    pub status: MachineStatus,
    pub motors_enabled: bool,
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
    pub paused_task_id: Option<crate::DbId>,
}

impl Actor for Machine {}
