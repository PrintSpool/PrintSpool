// Package Revison 1 (LATEST)
use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};
// use std::collections::VecDeque;

// use crate::models::versioned_model::{
//     VersionedModel,
//     ScopedTree,
// };
// use super::machine_status_r1::MachineStatus;

// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct SpeedController {
    pub id: u64,
    // Foreign Keys
    pub component_id: ID,
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Props
    pub address: String,
    #[new(default)]
    pub target_speed: Option<f32>,
    #[new(default)]
    pub actual_speed: Option<f32>,
    #[new(default)]
    pub enabled: bool,
}
