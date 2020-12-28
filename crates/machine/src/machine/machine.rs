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

#[derive(new, Debug, Clone)]
pub struct MachineData {
    // Config-driven data and ephemeral component data
    pub config: MachineConfig,
    // Top-level ephemeral machine data
    #[new(default)]
    pub status: MachineStatus,
    #[new(default)]
    pub motors_enabled: bool,
    #[new(default)]
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
    #[new(default)]
    pub paused_task_id: Option<crate::DbId>,
}

impl Actor for Machine {}
