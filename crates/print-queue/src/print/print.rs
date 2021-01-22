use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Print {
    #[new(value = "nanoid!()")]
    pub id: crate::DbId,
    #[new(default)]
    pub version: i32,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub part_id: crate::DbId, // parts have many (>=0) print_tasks
    pub task_id: crate::DbId, // print_tasks have one task
    // Props
    pub estimated_print_time: Option<std::time::Duration>,
    pub estimated_filament_meters: Option<f64>,
}

#[async_trait::async_trait]
impl Record for Print {
    const TABLE: &'static str = "prints";

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
                INSERT INTO prints
                (id, version, props, part_id, task_id)
                VALUES (?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            self.part_id,
            self.task_id,
            // self.quantity,
            // self.position,
        )
            .fetch_one(db)
            .await?;
        Ok(())
    }
}
