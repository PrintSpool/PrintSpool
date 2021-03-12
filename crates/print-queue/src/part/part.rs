use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use teg_json_store::Record;

// use crate::package::Package;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Part {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    // Foreign Keys
    pub package_id: crate::DbId, // packages have many (>=1) parts
    // Props
    pub name: String,

    pub quantity: i32,
    pub position: u64,
    pub file_path: String,
}

impl Part {
    // pub fn total_prints(&self, package: &Package) -> u64 {
    //     self.quantity * package.quantity
    // }

    // pub fn started_final_print(&self, package: &Package) -> bool {
    //     self.printed >= self.total_prints(package)
    // }

    pub async fn query_prints_in_progress<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
        include_finished_prints: bool,
    ) -> Result<i32>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let finished_arg = if include_finished_prints {
            "finished"
        } else {
            // If we are not querying for finished prints just replace it with an invalid status
            "unused_void"
        };

        let in_progress = sqlx::query!(
            r#"
                SELECT
                    COUNT(id) as in_progress
                FROM tasks
                WHERE
                    part_id = ?
                    AND tasks.status IN ('spooled', 'started', 'paused', ?)
                "#,
            part_id,
            finished_arg,
        )
            .fetch_one(db)
            .await?
            .in_progress;
        Ok(in_progress)
    }

    pub async fn query_prints_completed<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
    ) -> Result<i32>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let printed = sqlx::query!(
            r#"
                SELECT
                    COUNT(id) as printed
                FROM tasks
                WHERE
                    part_id = ?
                    AND tasks.status = 'finished'
                "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .printed;
        Ok(printed)
    }

    pub async fn query_total_prints<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
    ) -> Result<i64>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let total = sqlx::query!(
            r#"
                SELECT
                    CAST(parts.quantity * packages.quantity AS INT) AS total
                FROM parts
                INNER JOIN packages ON packages.id = parts.package_id
                WHERE parts.id = ?
            "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .total
            .ok_or_else(|| eyre!("invalid part or package quantity for part {:?}", part_id))?;
        Ok(total)
    }

    pub async fn started_final_print<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
    ) -> Result<bool>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let part_stats = sqlx::query!(
            r#"
                SELECT
                    COUNT(tasks.id) AS printed,
                    CAST(parts.quantity * packages.quantity AS INT) AS total
                FROM parts
                LEFT JOIN tasks ON
                    tasks.part_id = parts.id
                    AND tasks.status NOT IN ('errored', 'cancelled')
                INNER JOIN packages ON
                    packages.id = parts.package_id
                WHERE
                    parts.id = ?
            "#,
            part_id,
        )
            .fetch_one(db)
            .await?;

        let total = part_stats.total
            .ok_or_else(|| eyre!(
                "unable to determine print status (part id: {:?}) due to missing total",
                part_id,
            ))?;

        let done = part_stats.printed as i64 >= total;
        Ok(done)
    }

    pub fn position_db_blob(&self) -> Vec<u8> {
        self.position.to_be_bytes().to_vec()
    }
}

#[async_trait::async_trait]
impl Record for Part {
    const TABLE: &'static str = "parts";

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

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()> {
        let json = serde_json::to_string(&self)?;
        let position = self.position_db_blob();

        sqlx::query!(
            r#"
                INSERT INTO parts
                (id, version, created_at, props, package_id, quantity, position)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            self.created_at,
            json,
            self.package_id,
            self.quantity,
            position,
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
        let position = self.position_db_blob();

        sqlx::query!(
            r#"
                UPDATE parts
                SET
                    props=?,
                    version=?,
                    quantity=?,
                    position=?,
                    deleted_at=?
                WHERE
                    id=?
                    AND version=?
            "#,
            // SET
            json,
            self.version,
            self.quantity,
            position,
            self.deleted_at,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
