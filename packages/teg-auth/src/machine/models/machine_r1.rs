// Package Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

use crate::models::VersionedModel;
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
}

impl Machine {
    pub fn stop(db: &sled::Db, id: u64) -> Result<Self> {
        let machine = Self::set_status(&db, id, |machine| {
            machine.stop_counter += 1;
            MachineStatus::Stopped
        })?;

        Ok(machine)
    }

    // TODO: always use this function to set machine status and then
    // add task stops to the transaciton
    pub fn set_status<F>(db: &sled::Db, id: u64, mut f: F) -> Result<Self>
    where
        F: Send + FnMut(&mut Self) -> MachineStatus
    {
        let get_next_status = &mut f;

        let machine = Self::get_and_update(&db, id, |mut machine| {
            machine.status = get_next_status(&mut machine);
            machine
        })?;

        Ok(machine)
    }
}
