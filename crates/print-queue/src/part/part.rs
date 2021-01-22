use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::Record;
// use anyhow::{
//   anyhow,
//   Result,
//   // Context as _,
// };

use crate::package::Package;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Part {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub print_queue_id: crate::DbId, // print queues have many (>=0) parts
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

    pub fn is_done(&self, package: &Package) -> bool {
        self.printed >= self.total_prints(package)
    }

    pub async fn query_prints_in_progress(
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        part_id: &crate::DbId,
    ) -> Result<u32> {
        let printed = sqlx::query!(
            r#"
                SELECT
                    COUNT(id)
                FROM print_tasks
                WHERE
                    part_id = ?
                    AND status IN ("Started", "Paused", "Finished")
            "#,
            &self.part_id,
        )
            .fetch_one(&mut db)
            .await?
            .printed;
        Ok(printed)
    }

    pub async fn query_total_prints(
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        part_id: &crate::DbId,
    ) -> Result<u32> {
        let quantity = sqlx::query!(
            r#"
                SELECT
                    parts.quantity * packages.quantity
                FROM parts
                INNER JOIN packages ON parts.package_id = package.id
                WHERE parts.id = ?
            "#,
            part_id,
        )
            .fetch_one(&mut db)
            .await?
            .quantity;
        Ok(printed)
    }
}

#[async_trait::async_trait]
impl Record for Part {
    const TABLE: &'static str = "tasks";

    fn id(&self) -> &crate::DbId {
        self.id
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
                INSERT INTO invites
                (id, version, props, quantity)
                VALUES (?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            self.quantity,
        )
            .fetch_one(db)
            .await?;
        Ok(())
    }
}
