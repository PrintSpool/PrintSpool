use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
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
    #[new(value = "None")]
    pub deleted_at: Option<DateTime<Utc>>,

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

#[async_trait::async_trait]
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
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()>
    {
        let json = serde_json::to_string(&self)?;
        sqlx::query!(
            r#"
                INSERT INTO machine_viewers
                (id, version, created_at, deleted_at, props, machine_id, user_id, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            self.created_at,
            self.deleted_at,
            json,
            self.machine_id,
            self.user_id,
            self.expires_at,
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
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let (json, previous_version) = self.prep_for_update()?;

        sqlx::query!(
            r#"
                UPDATE machine_viewers
                SET
                    props=?,
                    version=?,
                    deleted_at=?,
                    expires_at=?
                WHERE
                    id=?
                    AND version=?
            "#,
            // SET
            json,
            self.version,
            self.deleted_at,
            self.expires_at,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
