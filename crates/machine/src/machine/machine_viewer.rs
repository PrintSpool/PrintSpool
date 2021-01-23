use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct MachineViewer {
    #[new(value = "nanoid!(11)")]
    pub id: crate::DbId,
    #[new(default)]
    pub version: i32,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,

    // Foreign Keys
    pub machine_id: crate::DbId,
    pub user_id: crate::DbId,
    // Timestamps
    #[new(value = "Utc::now() + chrono::Duration::seconds(5)")]
    pub expires_at: DateTime<Utc>,
}

impl MachineViewer {
    pub async fn continue_viewing(&mut self, db: &crate::Db) -> Result<()> {
        self.expires_at = Utc::now() + chrono::Duration::seconds(5);
        self.update(db).await?;
        Ok(())
    }

    pub fn is_expired(&self) -> bool {
        self.expires_at < Utc::now()
    }
}

impl Record for MachineViewer {
    const TABLE: &'static str = "machine_viewers";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> teg_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut teg_json_store::Version {
        &mut self.version
    }
}
