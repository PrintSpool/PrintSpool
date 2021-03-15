use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use async_graphql::{
    ID,
};

use super::super::SignallingUpdater;

pub struct MachineSignallingUpdate {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    // Props
    machine_id: crate::DbId,
    operation: MachineUpdateOperation,
}

pub enum MachineUpdateOperation {
    Register { name: String },
    Delete,
}


impl MachineSignallingUpdate {
    async fn create<'e, 'c, E>(
        db: E,
        updater: xactor::Addr<SignallingUpdater>,
        operation: MachineUpdateOperation,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        MachineSignallingUpdate {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            deleted_at: None,
            operation,
        }
            .insert(db)
            .await?;

        updater.send(SyncChanges).await?;

        Ok(())
    }
}

impl Record for MachineSignallingUpdate {
    const TABLE: &'static str = "machine_signalling_update";

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
