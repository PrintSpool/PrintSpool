use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use printspool_json_store::{ Record, JsonRow };

use crate::part::Part;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrintQueue {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    // Foreign Keys
    // Props
    pub name: String,
}

impl PrintQueue {
    pub async fn get_parts<'e, 'c, E>(
        db: E,
        print_queue_id: &crate::DbId,
    ) -> Result<Vec<Part>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let parts = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT parts.props FROM parts
                INNER JOIN packages ON packages.id = parts.package_id
                WHERE
                    packages.print_queue_id = $1
                    AND parts.deleted_at IS NULL
                ORDER BY parts.position ASC
            "#,
            print_queue_id,
        )
            .fetch_all(db)
            .await?;

        let parts = Part::from_rows(parts)?;

        Ok(parts)
    }
}

#[async_trait::async_trait]
impl Record for PrintQueue {
    const TABLE: &'static str = "print_queues";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> printspool_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut printspool_json_store::Version {
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
