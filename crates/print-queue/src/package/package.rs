use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use teg_json_store::{
    Record,
    JsonRow,
};
use teg_machine::task::Task;

use crate::part::Part;

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct Package {
    #[new(value = "nanoid!(11)")]
    pub id: crate::DbId,
    #[new(default)]
    pub version: i32,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    #[new(default)]
    pub deleted_at: Option<DateTime<Utc>>,
    // Foreign Keys
    pub print_queue_id: crate::DbId, // print queues have many (>=0) packages queued for printing
    // Props
    pub name: String,
    pub quantity: i32,
    // #[new(value = "true")]
    // pub delete_files_after_print: bool,
}

impl Package {
    // pub fn total_prints(&self, parts: &Vec<Part>) -> u64 {
    //     self.quantity * parts.iter().map(|part| part.quantity).sum::<u64>()
    // }

    pub async fn query_prints_completed<'e, 'c, E>(
        db: E,
        package_id: &crate::DbId,
    ) -> Result<i32>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let printed = sqlx::query!(
            r#"
                SELECT
                    COUNT(tasks.id) AS printed
                FROM tasks
                INNER JOIN parts ON parts.id = tasks.part_id
                WHERE
                    parts.package_id = ?
                    AND tasks.status = 'finished'
            "#,
            package_id,
        )
            .fetch_one(db)
            .await?
            .printed;

        Ok(printed)
    }

    pub async fn query_total_prints<'e, 'c, E>(
        db: E,
        package_id: &crate::DbId,
    ) -> Result<i64>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let total = sqlx::query!(
            r#"
                SELECT
                    CAST(parts.quantity * packages.quantity AS INT) AS total
                FROM parts
                INNER JOIN packages ON parts.package_id = packages.id
                WHERE packages.id = ?
            "#,
            package_id,
        )
            .fetch_one(db)
            .await?
            .total
            .ok_or_else(|| eyre!("invalid part or package quantity for package {:?}", package_id))?;

        Ok(total)
    }

    pub async fn started_final_print<'e, 'c, E>(
        db: E,
        package_id: &crate::DbId,
    ) -> Result<bool>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite> + Copy,
    {
        for part in Self::get_parts(db, package_id).await? {
            let is_done = Part::started_final_print(db, &part.id).await?;
            if !is_done {
                return Ok(false)
            }
        }

        Ok(true)
        //     let done = sqlx::query!(
        //         r#"
        //             SELECT
        //                 COUNT(tasks.id) AS printed,
        //                 CAST(parts.quantity * packages.quantity AS INT) AS total
        //             FROM parts
        //             LEFT JOIN tasks ON tasks.part_id = parts.id
        //             INNER JOIN packages ON parts.package_id = packages.id
        //             WHERE packages.id = ?
        //         "#,
        //         package_id,
        //     )
        //         .fetch_all(&mut db)
        //         .await?
        //         .into_iter()
        //         .every(|part_stats| part_stats.printed >= part_stats.total);

    //     Ok(done)
    }

    pub async fn get_parts<'e, 'c, E>(
        db: E,
        package_id: &crate::DbId,
    ) -> Result<Vec<Part>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let parts = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM parts
                WHERE
                    deleted_at IS NULL
                    AND package_id = ?
            "#,
            package_id,
        )
            .fetch_all(db)
            .await?;

        let parts = Part::from_rows(parts)?;

        Ok(parts)
    }

    pub async fn get_tasks(db: &crate::Db, package_id: &crate::DbId) -> Result<Vec<Task>> {
        let tasks = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT tasks.props FROM tasks
                INNER JOIN parts ON parts.id = tasks.part_id
                WHERE
                    parts.deleted_at IS NULL
                    AND parts.package_id = ?
            "#,
            package_id,
        )
            .fetch_all(db)
            .await?;

        let tasks = Task::from_rows(tasks)?;

        Ok(tasks)
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

        sqlx::query!(
            r#"
                INSERT INTO packages
                (id, version, created_at, props, print_queue_id, quantity)
                VALUES (?, ?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            self.created_at,
            json,
            self.print_queue_id,
            self.quantity,
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

        sqlx::query!(
            r#"
                UPDATE packages
                SET
                    props=?,
                    version=?,
                    quantity=?,
                    deleted_at=?
                WHERE
                    id=?
                    AND version=?
            "#,
            // SET
            json,
            self.version,
            self.quantity,
            self.deleted_at,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
