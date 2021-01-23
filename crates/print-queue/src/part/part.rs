use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;

use crate::package::Package;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Part {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub package_id: crate::DbId, // packages have many (>=1) parts
    // Props
    pub name: String,

    pub quantity: u64,
    pub position: u64,
    pub file_path: String,
}

impl Part {
    pub fn total_prints(&self, package: &Package) -> u64 {
        self.quantity * package.quantity
    }

    // pub fn is_done(&self, package: &Package) -> bool {
    //     self.printed >= self.total_prints(package)
    // }

    pub async fn query_prints_in_progress<'c>(
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        part_id: &crate::DbId,
    ) -> Result<i32> {
        let printed = sqlx::query!(
            r#"
                SELECT
                    COUNT(id) as printed
                FROM tasks
                WHERE
                    part_id = ?
                    AND tasks.status IN ('started', 'paused', 'finished')
                "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .printed;
        Ok(printed)
    }

    pub async fn query_total_prints<'c>(
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        part_id: &crate::DbId,
    ) -> Result<u32> {
        // parts.props * packages.quantity
        let total = sqlx::query!(
            r#"
                SELECT
                    parts.quantity * packages.quantity AS total
                FROM parts
                INNER JOIN packages ON parts.package_id = packages.id
                WHERE parts.id = ?
            "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .total;
        Ok(total)
    }

    pub async fn is_done(
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        part_id: &crate::DbId,
    ) -> Result<u32> {
        let part_stats = sqlx::query!(
            r#"
                SELECT
                    COUNT(id) AS printed,
                    parts.quantity * packages.quantity AS total
                FROM parts
                WHERE part.id = ?
            "#,
            part_id,
        )
            .fetch_one(&mut db)
            .await?;

        let done = part_stats.printed >= part_stats.total;
        Ok(done)
    }

    pub fn quantity_db_blob(&self) -> Vec<u8> {
        self.quantity.to_be_bytes().to_vec()
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
        let quantity = self.quantity_db_blob();

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
            quantity,
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
        let quantity = self.quantity_db_blob();

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
            quantity,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }
}
