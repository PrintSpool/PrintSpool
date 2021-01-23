use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;

use super::{
    GCodeAnnotation,
    TaskStatus,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub machine_id: crate::DbId, // machines have many (>=0) tasks
    pub part_id: Option<crate::DbId>, // parts have many (>=0) print tasks
    // Content
    pub content: TaskContent,
    // Props
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    pub despooled_line_number: Option<u64>,
    pub machine_override: bool,
    pub estimated_print_time: Option<std::time::Duration>,
    pub estimated_filament_meters: Option<f64>,
    // #[new(default)]
    // pub sent_to_machine: bool,
    #[serde(default)]
    pub status: TaskStatus,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
    FilePath(String),
    GCodes(Vec<String>),
}

#[async_trait::async_trait]
impl Record for Task {
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
        let status = self.status.to_db_str();

        sqlx::query!(
            r#"
                INSERT INTO tasks
                (id, version, props, machine_id, part_id, status)
                VALUES (?, ?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            self.machine_id,
            self.part_id,
            status,
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
        let status = self.status.to_db_str();

        sqlx::query!(
            r#"
                UPDATE tasks
                SET
                    props=?,
                    version=?,
                    status=?
                WHERE
                    id=?
                    AND version=?
            "#,
            // SET
            json,
            self.version,
            status,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }
}
