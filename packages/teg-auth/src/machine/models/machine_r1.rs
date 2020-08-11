// Package Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

use super::machine_status_r1::MachineStatus;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Machine {
    pub id: ID,
    // Foreign Keys
    pub config_id: ID,
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Props
    #[new(default)]
    pub status: MachineStatus,
}

