use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;

use crate::part::Part;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Package {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub print_queue_id: crate::DbId, // print queues have many (>=0) packages queued for printing
    // Props
    pub name: String,
    pub quantity: u64,
    // #[new(value = "true")]
    // pub delete_files_after_print: bool,
}

impl Package {
    pub fn total_prints(&self, parts: &Vec<Part>) -> u64 {
        self.quantity * parts.iter().map(|part| part.quantity).sum::<u64>()
    }

    pub async fn query_total_prints(
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        package_id: &crate::DbId,
    ) -> Result<u32> {
        let quantity = sqlx::query!(
            r#"
                SELECT
                    SUM(parts.quantity * packages.quantity)
                FROM parts
                INNER JOIN packages ON parts.package_id = package.id
                WHERE packages.id = ?
            "#,
            package_id,
        )
            .fetch_one(&mut db)
            .await?
            .quantity;
        Ok(printed)
    }

    pub fn is_done(&self, parts: &Vec<Part>) -> bool {
        parts
            .iter()
            .all(|part| part.is_done(&self))
    }
}

#[async_trait::async_trait]
impl Record for Package {
    const TABLE: &'static str = "packages";

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
                INSERT INTO packages
                (id, version, props, print_queue_id)
                VALUES (?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            self.print_queue_id,
            // self.quantity,
        )
            .fetch_one(db)
            .await?;
        Ok(())
    }
}
