// TODO: move this back to core

use chrono::prelude::*;
use async_graphql::ID;
use serde::{Deserialize, Serialize};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct MachineViewer {
    // Foreign Keys
    pub machine_id: u64,
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
