use chrono::prelude::*;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use serde::{Deserialize, Serialize};
use teg_json_store::Record;

use super::SignallingUpdater;
use super::SyncChanges;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineSignallingUpdate {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    // Props
    pub machine_id: crate::DbId,
    pub operation: MachineUpdateOperation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MachineUpdateOperation {
    Register { name: String },
    Delete,
}


impl MachineSignallingUpdate {
    pub async fn create<'c>(
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        updater: xactor::Addr<SignallingUpdater>,
        machine_id: crate::DbId,
        operation: MachineUpdateOperation,
    ) -> Result<()>
    {
        MachineSignallingUpdate {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            deleted_at: None,
            machine_id,
            operation,
        }
            .insert_no_rollback(db)
            .await?;

        updater.send(SyncChanges)?;

        Ok(())
    }
}

impl Record for MachineSignallingUpdate {
    const TABLE: &'static str = "machine_signalling_updates";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> teg_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut teg_json_store::Version {
        &mut self.version
    }

    fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    fn deleted_at(&self) -> Option<DateTime<Utc>> {
        self.deleted_at
    }

    fn deleted_at_mut(&mut self) -> &mut Option<DateTime<Utc>> {
        &mut self.deleted_at
    }
}
