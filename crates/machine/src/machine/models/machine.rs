use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

use super::machine_status::MachineStatus;
use super::gcode_history_entry::GCodeHistoryEntry;

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

#[derive(Default, Debug, Serialize, Deserialize, Clone)]
pub struct Machine {
    pub status: MachineStatus,
    pub motors_enabled: bool,
    // pub stop_counter: u64, // Number of times the machine has been stopped through the GraphQL API
    // pub reset_counter: u64, // Number of times the machine has been reset through the GraphQL API
    pub pausing_task_id: Option<u64>,
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
}
