use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use printspool_json_store::{JsonRow, Record};

// use crate::package::Package;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PartTemplate {
    pub part_id: crate::DbId,
    pub package_id: crate::DbId,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Part {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,

    // Foreign Keys
    pub package_id: crate::DbId, // packages have many (>=1) parts
    /// The starred package and part that this part is based on
    #[serde(default)]
    pub based_on: Option<PartTemplate>,
    // Props
    pub name: String,
    pub quantity: i32,
    pub position: i64,
    pub file_path: String,
}

impl Part {
    // pub fn total_prints(&self, package: &Package) -> u64 {
    //     self.quantity * package.quantity
    // }

    // pub fn started_final_print(&self, package: &Package) -> bool {
    //     self.printed >= self.total_prints(package)
    // }

    pub async fn query_prints_in_progress<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
        include_finished_prints: bool,
    ) -> Result<i64>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let finished_arg = if include_finished_prints {
            "finished"
        } else {
            // If we are not querying for finished prints just replace it with an invalid status
            "unused_void"
        };

        let in_progress = sqlx::query!(
            r#"
                SELECT
                    COUNT(id) as in_progress
                FROM tasks
                WHERE
                    part_id = $1
                    AND tasks.status IN ('spooled', 'started', 'paused', $2)
                "#,
            part_id,
            finished_arg,
        )
            .fetch_one(db)
            .await?
            .in_progress
            .unwrap_or(0i64);

        Ok(in_progress)
    }

    pub async fn query_prints_completed<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
    ) -> Result<i64>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let printed = sqlx::query!(
            r#"
                SELECT
                    COUNT(id) as printed
                FROM tasks
                WHERE
                    part_id = $1
                    AND tasks.status = 'finished'
                "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .printed
            .unwrap_or(0i64);

        Ok(printed)
    }

    pub async fn query_total_prints<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
    ) -> Result<i64>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let total = sqlx::query!(
            r#"
                SELECT
                    CAST(parts.quantity * packages.quantity AS BIGINT) AS total
                FROM parts
                INNER JOIN packages ON packages.id = parts.package_id
                WHERE parts.id = $1
            "#,
            part_id,
        )
            .fetch_one(db)
            .await?
            .total
            .ok_or_else(|| eyre!("invalid part or package quantity for part {:?}", part_id))?;

        Ok(total)
    }

    pub async fn started_final_print<'e, 'c, E>(
        db: E,
        part_id: &crate::DbId,
    ) -> Result<bool>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let part_stats = sqlx::query!(
            r#"
                SELECT
                    COUNT(tasks.id) AS printed,
                    CAST(parts.quantity * packages.quantity AS BIGINT) AS total
                FROM parts
                LEFT JOIN tasks ON
                    tasks.part_id = parts.id
                    AND tasks.status NOT IN ('errored', 'cancelled')
                INNER JOIN packages ON
                    packages.id = parts.package_id
                WHERE
                    parts.id = $1
                GROUP BY
                    parts.id,
                    parts.quantity,
                    packages.quantity
            "#,
            part_id,
        )
            .fetch_one(db)
            .await?;

        let total = part_stats.total
            .ok_or_else(|| eyre!(
                "unable to determine print status (part id: {:?}) due to missing total",
                part_id,
            ))?;

        let done = part_stats.printed.unwrap_or(0) >= total;
        Ok(done)
    }

    pub async fn fetch_next_part<'e, 'c, E>(
        db: E,
        machine_id: &crate::DbId,
    ) -> Result<Option<Part>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let part = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT
                    parts.props
                FROM parts
                LEFT JOIN tasks ON
                    tasks.part_id = parts.id
                    AND tasks.status NOT IN ('errored', 'cancelled')
                INNER JOIN packages ON
                    packages.id = parts.package_id
                INNER JOIN machine_print_queues ON
                    machine_print_queues.print_queue_id = packages.print_queue_id
                    AND machine_print_queues.machine_id = $1
                GROUP BY
                    parts.id,
                    parts.quantity,
                    packages.quantity
                HAVING
                    COUNT(tasks.id) < (parts.quantity * packages.quantity)
                    AND parts.deleted_at IS NULL
                ORDER BY
                    parts.position
                LIMIT 1
            "#,
            machine_id,
        )
            .fetch_optional(db)
            .await?
            .map(|row| Part::from_row(row))
            .transpose()?;

        Ok(part)
    }
}

#[async_trait::async_trait]
impl Record for Part {
    const TABLE: &'static str = "parts";

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

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Postgres>,
    ) -> Result<()>
    {
        let json = serde_json::to_value(&self)?;

        let based_on_package_id = self.based_on
            .as_ref()
            .map(|based_on| &based_on.package_id);

        let based_on_part_id = self.based_on
            .as_ref()
            .map(|based_on| &based_on.part_id);

        sqlx::query!(
            r#"
                INSERT INTO parts
                (
                    id,
                    version,
                    created_at,
                    deleted_at,
                    props,
                    package_id,
                    based_on_package_id,
                    based_on_part_id,
                    quantity,
                    position
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#,
            self.id,
            self.version,
            self.created_at,
            self.deleted_at,
            json,
            self.package_id,
            based_on_package_id,
            based_on_part_id,
            self.quantity,
            self.position,
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
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let (json, previous_version) = self.prep_for_update()?;

        let based_on_package_id = self.based_on
            .as_ref()
            .map(|based_on| &based_on.package_id);

        let based_on_part_id = self.based_on
            .as_ref()
            .map(|based_on| &based_on.part_id);

        sqlx::query!(
            r#"
                UPDATE parts
                SET
                    props=$1,
                    version=$2,
                    based_on_package_id=$3,
                    based_on_part_id=$4,
                    quantity=$5,
                    position=$6,
                    deleted_at=$7
                WHERE
                    id=$8
                    AND version=$9
            "#,
            // SET
            json,
            self.version,
            based_on_package_id,
            based_on_part_id,
            self.quantity,
            self.position,
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
