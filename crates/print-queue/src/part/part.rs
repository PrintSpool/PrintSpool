use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    anyhow,
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

    // pub fn is_done(&self, package: &Package) -> bool {
    //     self.printed >= self.total_prints(package)
    // }

    pub async fn query_prints_in_progress<'e, 'c, E>(
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
                    AND tasks.status IN ('spooled', 'started', 'paused', 'finished')
                "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .printed;
        Ok(printed)
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
            .ok_or_else(|| anyhow!("invalid part or package quantity"))?;
        Ok(total)
    }

    pub async fn is_done<'e, 'c, E>(
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
                INNER JOIN tasks ON tasks.part_id = parts.id
                INNER JOIN packages ON packages.id = parts.package_id
                WHERE parts.id = ?
            "#,
            part_id,
        )
            .fetch_one(db)
            .await?;

        let total = part_stats.total
            .ok_or_else(|| anyhow!("invalid part or package quantity"))?;

        let done = part_stats.printed as i64 >= total;
        Ok(done)
    }
}

#[async_trait::async_trait]
impl Record for Part {
    const TABLE: &'static str = "tasks";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> teg_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut teg_json_store::Version {
        &mut self.version
    }

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()> {
        let json = serde_json::to_string(&self)?;

        sqlx::query!(
            r#"
                INSERT INTO parts
                (id, version, props, package_id, quantity)
                VALUES (?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            self.package_id,
            self.quantity,
        )
            .fetch_one(db)
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
                UPDATE packages
                SET
                    props=?,
                    version=?,
                    quantity=?
                WHERE
                    id=?
                    AND version=?
            "#,
            // SET
            json,
            self.version,
            self.quantity,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }
}
