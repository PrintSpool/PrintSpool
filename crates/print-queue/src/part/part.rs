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
                FROM prints
                WHERE
                    part_id = ?
                    AND JSON_EXTRACT(props, '$.status') IN ("Started", "Paused", "Finished")
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
        let quantity = sqlx::query!(
            r#"
                SELECT
                    id,
                    CAST(
                        JSON_EXTRACT(parts.props, '$.quantity') *
                        JSON_EXTRACT(packages.props, '$.quantity')
                    AS NUMERIC) AS quantity
                FROM parts
                INNER JOIN packages ON parts.package_id = packages.id
                WHERE parts.id = ?
            "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .quantity;
        Ok(quantity)
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
                (id, version, props, package_id)
                VALUES (?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            // self.print_queue_id,
            self.package_id,
            // self.quantity,
            // self.position,
        )
            .fetch_one(db)
            .await?;
        Ok(())
    }
}
