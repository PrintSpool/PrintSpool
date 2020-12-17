use std::collections::VecDeque;
use serde::{Deserialize, Serialize};
use chrono::prelude::*;

#[derive(Default, Debug, Clone)]
pub struct HeaterEphemeral {
    pub target_temperature: Option<f32>,
    pub actual_temperature: Option<f32>,
    pub enabled: bool,
    pub blocking: bool,
    pub history: VecDeque<TemperatureHistoryEntry>,
}

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct TemperatureHistoryEntry {
    pub id: u64,
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Props
    #[new(default)]
    pub target_temperature: Option<f32>,
    #[new(default)]
    pub actual_temperature: Option<f32>,
}
