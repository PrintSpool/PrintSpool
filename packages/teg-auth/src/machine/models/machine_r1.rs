// Package Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

use crate::models::versioned_model::{
    VersionedModel,
    ScopedTree,
};
use super::machine_status_r1::MachineStatus;

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Machine {
    pub id: u64,
    // Foreign Keys
    pub config_id: ID,
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Props
    #[new(default)]
    pub status: MachineStatus,
    #[new(default)]
    pub stop_counter: u64, // Number of times the machine has been stopped through the GraphQL API
    #[new(default)]
    pub reset_counter: u64, // Number of times the machine has been reset through the GraphQL API
    // Embedded Collections
    #[new(default)]
    #[serde(default)]
    pub viewers: Vec<MachineViewer>
}

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct MachineViewer {
    // Foreign Keys
    pub user_id: u64,
    // Props
    pub session_id: String,
    // Timestamps
    #[new(value = "Utc::now() + chrono::Duration::seconds(5)")]
    pub expires_at: DateTime<Utc>,
}

impl MachineViewer {
    pub fn continue_viewing(&mut self) {
        self.expires_at = Utc::now() + chrono::Duration::seconds(5);
    }

    pub fn is_expired(&self) -> bool {
        self.expires_at < Utc::now()
    }
}

impl Machine {
    pub fn stop(db: &impl ScopedTree, id: u64) -> Result<Self> {
        let machine = Self::set_status(db, id, |machine| {
            machine.stop_counter += 1;
            MachineStatus::Stopped
        })?;

        Ok(machine)
    }

    pub fn set_status<F>(db: &impl ScopedTree, id: u64, f: F) -> Result<Self>
    where
        F: Send + Fn(&mut Self) -> MachineStatus
    {
        let get_next_status = f;

        let machine = Self::get_and_update(db, id, move |mut machine| {
            machine.status = get_next_status(&mut machine);
            machine
        })?;

        Ok(machine)
    }
}
