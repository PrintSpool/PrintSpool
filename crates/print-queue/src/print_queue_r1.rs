// PrintQueue Revison 1 (LATEST)
use chrono::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct PrintQueue {
    pub id: crate::DbId,
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
}
