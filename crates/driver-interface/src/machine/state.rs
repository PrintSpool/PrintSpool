use super::{GCodeHistoryEntry, Machine, MachineStatus, PositioningUnits};
use crate::DbId;
#[allow(unused)]
use chrono::prelude::*;
use chrono::{DateTime, Utc};
use derive_new::new;
use eyre::Result;
use printspool_proc_macros::printspool_collection;
use std::collections::VecDeque;

#[printspool_collection(id = false)]
pub struct MachineState {
    // Foreign Keys
    #[printspool(foreign_key)]
    pub machine_id: DbId<Machine>,

    // Top-level ephemeral machine data
    #[new(default)]
    pub status: MachineStatus,
    #[new(default)]
    pub motors_enabled: bool,
    #[new(value = "true")]
    pub absolute_positioning: bool,
    #[new(default)]
    pub positioning_units: PositioningUnits,
    #[new(default)]
    pub blocked_at: Option<DateTime<Utc>>,
    #[new(default)]
    pub gcode_history: VecDeque<GCodeHistoryEntry>,
}
