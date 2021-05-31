use chrono::prelude::*;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use serde::{Deserialize, Serialize};
use teg_json_store::Record;

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
        mut tx: sqlx::Transaction<'c, sqlx::Postgres>,
        machine_id: crate::DbId,
        operation: MachineUpdateOperation,
    ) -> Result<(sqlx::Transaction<'c, sqlx::Postgres>, Self)>
    {
        sqlx::query!(
            r#"
                DELETE FROM machine_signalling_updates
                WHERE machine_id = $1
            "#,
            machine_id
        )
            .fetch_optional(&mut tx)
            .await?;

        let update = MachineSignallingUpdate {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            deleted_at: None,
            machine_id,
            operation,
        };

        update
            .insert_no_rollback(&mut tx)
            .await?;

        Ok((tx, update))
    }
}

#[async_trait::async_trait]
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

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Postgres>,
    ) -> Result<()>
    {
        let json = serde_json::to_value(&self)?;
        sqlx::query!(
            r#"
                INSERT INTO machine_signalling_updates
                (id, version, created_at, props, machine_id)
                VALUES ($1, $2, $3, $4, $5)
            "#,
            self.id,
            self.version,
            self.created_at,
            json,
            self.machine_id,
        )
            .fetch_optional(db)
            .await?;
        Ok(())
    }
}
