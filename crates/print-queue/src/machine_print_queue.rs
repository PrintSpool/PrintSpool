use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_json_store::Record;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MachinePrintQueue {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    // Foreign Keys
    pub machine_id: crate::DbId,
    pub print_queue_id: crate::DbId,
}

#[async_trait::async_trait]
impl Record for MachinePrintQueue {
    const TABLE: &'static str = "machine_print_queues";

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
                INSERT INTO machine_print_queues
                (id, version, created_at, props, deleted_at, machine_id, print_queue_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
            self.id,
            self.version,
            self.created_at,
            json,
            self.deleted_at,
            self.machine_id,
            self.print_queue_id,
        )
            .fetch_optional(db)
            .await?;
        Ok(())
    }

    async fn update<'e, 'c, E>(
        &mut self,
        db: E,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let (json, previous_version) = self.prep_for_update()?;

        sqlx::query!(
            r#"
                UPDATE machine_print_queues
                SET
                    props = $1,
                    version = $2,
                    deleted_at = $3,
                    machine_id = $4,
                    print_queue_id = $5
                WHERE
                    id=$6
                    AND version=$7
            "#,
            // SET
            json,
            self.version,
            self.deleted_at,
            self.machine_id,
            self.print_queue_id,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
