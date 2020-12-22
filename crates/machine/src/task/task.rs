use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::task_status::TaskStatus;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: u32,
    // Foreign Keys
    pub machine_id: u32, // machines have many (>=0) tasks
    // Timestamps
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Content
    pub content: TaskContent,
    // Props
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    #[new(default)]
    pub despooled_line_number: Option<u64>,
    #[new(default)]
    pub machine_override: bool,
    // #[new(default)]
    // pub sent_to_machine: bool,
    #[new(default)]
    pub status: TaskStatus,
    #[new(default)]
    pub error_message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskContent {
    FilePath(String),
    GCodes(Vec<String>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum GCodeAnnotation {
    SetToolheadMaterials()
}


impl Task {
    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<()> {
        sqlx::query!(r#"
            INSERT INTO tasks
            (id, machine_id, json)
            VALUES ?, ?, ?
        "#)
            .bind(self.id)
            .bind(self.machine_id)
            .bind(serde_json::to_string(self)?)
            .await?;
        
        Ok(())
    }

    pub async fn update(
        &self,
        db: &crate::Db,
    ) -> Result<()> {
        sqlx::query!(r#"
            UPDATE tasks
            SET json=?
        "#)
            .bind(serde_json::to_string(self)?)
            .await?;

        Ok(())
    }
}
