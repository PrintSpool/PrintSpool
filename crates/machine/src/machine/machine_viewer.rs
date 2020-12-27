use chrono::prelude::*;
use serde::{Deserialize, Serialize};
// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct MachineViewer {
    pub id: crate::DbId,
    pub version: crate::DbId,
    pub created_at: DateTime<Utc>,

    // Foreign Keys
    pub machine_id: crate::DbId,
    pub user_id: crate::DbId,
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

