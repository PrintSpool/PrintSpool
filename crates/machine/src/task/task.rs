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
pub struct Task {
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

impl Task {
    pub async fn get(
        db: &crate::Db,
        table_name: String,
        id: crate::DbId,
    ) -> Result<Self> {
        #[derive(sqlx::FromRow)]
        struct JsonRow {
            pub props: String,
        }
        
        let sql_query = format!("SELECT props FROM {} WHERE id = ?", table_name);
        let row: JsonRow = sqlx::query_as(&sql_query)
            .bind(id)
            .fetch_one(db)
            .await?;

            let entry: Self = serde_json::from_str(&row.props)?;
        Ok(entry)
    }

    // pub async fn insert(
    //     &self,
    //     table_name: String,
    //     db: &crate::Db,
    // ) -> Result<()> {
    //     let json = serde_json::to_string(self)?;

    //     let sql_query = format!(
    //         r#"
    //             INSERT INTO {}
    //             (id, machine_id, props)
    //             VALUES (?, ?, ?)
    //         "#,
    //         table_name,
    //     );

    //     sqlx::query(&sql_query)
    //         .bind(self.id)
    //         .bind(self.machine_id)
    //         .bind(json)
    //         .fetch_one(db)
    //         .await?;

    //     Ok(())
    // }

    pub async fn update<T: serde::Serialize>(
        db: &crate::Db,
        table_name: String,
        entry: T, 
    ) -> Result<()> {
        let previous_version = entry.version;
        entry.version = entry.version + 1;

        let json = serde_json::to_string(entry)?;

        let sql_query = format!(
            r#"
                UPDATE {}
                SET props=?, version=?
                WHERE id=? AND version=?
            "#,
            table_name,
        );

        sqlx::query(&sql_query)
            .bind(json)
            .bind(entry.version)
            .bind(entry.id)
            .bind(previous_version)
            .fetch_one(db)
            .await?;

        Ok(())
    }
}
