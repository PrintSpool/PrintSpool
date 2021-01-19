use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::{
    GCodeAnnotation,
    TaskStatus,
};

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

#[derive(Debug, Clone)]
pub enum AnyTask {
    Saved(Task),
    Unsaved(UnsavedTask),
}

impl AnyTask {
    pub fn machine_override(&self) -> bool {
        match self {
            AnyTask::Saved(task) => task.machine_override,
            AnyTask::Unsaved(task) => task.machine_override,
        }
    }
}

// TODO: Create a macro to generate this JSON Store code
// -------------------------------------------------------------
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedTask {
    pub machine_id: crate::DbId, // machines have many (>=0) tasks
    // Content
    pub content: TaskContent,
    // Props
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    pub machine_override: bool,
}

struct JsonRow {
    pub props: String,
}


impl UnsavedTask {
    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<Task> {
        let db = db.begin().await?;

        let (user, db) = self.insert_no_rollback(db).await?;

        db.commit().await?;

        Ok(user)
    }

    /// Insert but without a transaction. Intended to be used inside functions that provide their
    /// own transactions.
    pub async fn insert_no_rollback<'c>(
        &self,
        mut db: sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<(Task, sqlx::Transaction<'c, sqlx::Sqlite>)> {
        // Generate an ID for the row
        sqlx::query!(
            r#"
                INSERT INTO materials
                (props)
                VALUES ("{}")
            "#
        )
            .fetch_one(&mut db)
            .await?;

        let id = sqlx::query!(
            "SELECT last_insert_rowid() as id"
        )
            .fetch_one(&mut db)
            .await?
            .id;

        // Add the sqlite-generated monotonic ID and other default fields in to the json
        let mut json = serde_json::to_value(self)?;
        let map = json
            .as_object_mut()
            .expect("Struct incorrectly serialized for JsonRow insert");

        map.insert("id".to_string(), id.into());
        map.insert("version".to_string(), 0.into());
        map.insert("created_at".to_string(), serde_json::to_value(Utc::now())?);

        // Update Sqlite - adding the modified JSON including the ID
        let json_string = json.to_string();
        sqlx::query!(
            r#"
                UPDATE materials
                SET props=?
                WHERE id=?
            "#,
            json_string,
            id,
        )
            .fetch_one(&mut db)
            .await?;

        let entry: Task = serde_json::from_value(json)?;

        Ok((entry, db))
    }
}

impl Task {
    pub async fn get(
        db: &crate::Db,
        id: crate::DbId,
    ) -> Result<Self> {
        let row = sqlx::query_as!(
            JsonRow,
            "SELECT props FROM tasks WHERE id = ?",
            id
        )
            .fetch_one(db)
            .await?;

        let entry: Self = serde_json::from_str(&row.props)?;
        Ok(entry)
    }

    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<()> {
        let json = serde_json::to_string(self)?;

        sqlx::query!(
            r#"
                INSERT INTO tasks
                (id, machine_id, props)
                VALUES (?, ?, ?)
            "#,
            self.id,
            self.machine_id,
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
        let previous_version = self.version;
        self.version = self.version + 1;

        let json = serde_json::to_string(self)?;

        sqlx::query!(
            r#"
                UPDATE tasks
                SET props=?, version=?
                WHERE id=? AND version=?
            "#,
            json,
            self.version,
            self.id,
            previous_version,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }
}
