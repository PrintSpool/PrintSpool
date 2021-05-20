use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_json_store::{ Record, JsonRow };

use crate::{MachineHooksList, machine::Machine, machine::MachineData};

use super::{
    GCodeAnnotation,
    TaskStatus,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
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

    #[serde(default)]
    /// The amount of time the task spent waiting on blocking GCodes eg. heating up the extruder.
    pub time_blocked: std::time::Duration,
    /// The amount of time the task was previously paused for. If the task is currently paused this
    /// excludes the current pause.
    #[serde(default)]
    pub time_paused: std::time::Duration,

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

impl Task {
    pub fn is_print(&self) -> bool {
        self.part_id.is_some()
    }

    pub async fn tasks_running_on_machine<'e, 'c, E>(
        db: E,
        machine_id: &crate::DbId,
    ) -> Result<Vec<Self>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let tasks = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM tasks
                WHERE
                    tasks.machine_id = ?
                    AND tasks.status IN ('spooled', 'started', 'paused')
            "#,
            machine_id,
        )
            .fetch_all(db)
            .await?;

        let tasks = Task::from_rows(tasks)?;
        Ok(tasks)
    }

    pub async fn settle_task<'c>(
        &mut self,
        mut tx: sqlx::Transaction<'c, sqlx::Sqlite>,
        machine_hooks: &MachineHooksList,
        machine_data: &MachineData,
        machine_addr: &xactor::Addr<Machine>,
    ) -> Result<()> {
        // Move the despooled line number to the end of the file if the print was successful
        if self.status.was_successful() {
            // Accounting for zero length tasks
            let total_lines = std::cmp::max(self.total_lines, 1);

            self.despooled_line_number = Some(total_lines - 1);
        }

        // Replace the completed GCodes with an empty vec to save space
        let content = std::mem::replace(
            &mut self.content,
            TaskContent::GCodes(vec![]),
        );

        let mut after_task_settle_cbs = vec![];
        for machine_hook in machine_hooks.iter() {
            let after_settle_cb = machine_hook.before_task_settle(
                &mut tx,
                machine_hooks,
                machine_data,
                machine_addr.clone(),
                &mut *self,
            ).await?;

            if let Some(after_settle_cb) = after_settle_cb {
                after_task_settle_cbs.push(after_settle_cb);
            }
        }

        // Delete the completed GCode file in a seperate task to prevent blocking the database on
        // disk IO
        if let TaskContent::FilePath(file_path) = content {
            let _ = async_std::task::spawn(async move {
                use async_std::fs::remove_file;

                if let Err(err) = remove_file(&file_path).await {
                    warn!("Unable to remove completed GCode file ({}): {:?}", file_path, err);
                }
            });
        }

        self.update(&mut tx).await?;
        tx.commit().await?;

        for after_settle_cb in after_task_settle_cbs {
            after_settle_cb.await;
        }

        Ok(())
    }
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

    fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    fn deleted_at(&self) -> Option<DateTime<Utc>> {
        self.deleted_at
    }

    fn deleted_at_mut(&mut self) -> &mut Option<DateTime<Utc>> {
        &mut self.deleted_at
    }

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()>
    {
        let json = serde_json::to_string(&self)?;
        let status = self.status.to_db_str();

        sqlx::query!(
            r#"
                INSERT INTO tasks
                (id, version, created_at, props, machine_id, part_id, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            self.created_at,
            json,
            self.machine_id,
            self.part_id,
            status,
        )
            .fetch_optional(db)
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
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
