use async_graphql::Json;
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::task_status::TaskStatus;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct TaskProps {
    pub id: crate::DbId,
    pub version: crate::DbId,
    // Foreign Keys
    pub machine_id: crate::DbId, // machines have many (>=0) tasks
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

pub struct JsonRow<T> {
    pub props: sqlx::types::Json<T>,
}

use std::ops::Deref;
impl<T> Deref for JsonRow<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        &self.props
    }
}

pub type Task = JsonRow<TaskProps>;

impl Task {
    pub async fn get(
        db: &crate::Db,
        id: crate::DbId,
    ) -> Result<Self> {
        let task = sqlx::query_as!(
            Self,
            "SELECT * FROM tasks WHERE id = ?",
            id
        )
            .fetch_one(db)
            .await?;

        Ok(task)
    }

    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<()> {
        let json = serde_json::to_string(self)?;
 
        sqlx::query!(
            r#"
                INSERT INTO tasks
                (id, props)
                VALUES (?, ?)
            "#,
            self.id,
            // self.version,
            // self.machine_id,
            json,
        )
            .fetch_one(db)
            .await?;
        
        Ok(())
    }

    pub async fn update(
        &mut self,
        db: &crate::Db,
    ) -> Result<()> {
        let version = self.version;
        self.version = self.version + 1;

        let json = serde_json::to_string(self)?;

        sqlx::query!(
            r#"
                UPDATE tasks
                SET props=?
                WHERE id=? AND version=?
            "#,
            json,
            self.id,
            version,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }
}
