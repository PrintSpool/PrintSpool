use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use teg_json_store::{Record, UnsavedRecord};

#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct PrintTask {
    #[new(value = "nanoid!()")]
    pub id: crate::DbId,
    #[new(default)]
    pub version: i32,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    // Foreign Keys
    pub package_id: crate::DbId, // packages have many (>=0) print_tasks
    pub part_id: crate::DbId, // parts have many (>=0) print_tasks
    pub task_id: crate::DbId, // print_tasks have one task
    // Props
    pub estimated_print_time: Option<std::time::Duration>,
    pub estimated_filament_meters: Option<f64>,
}

impl Record for PrintTask {
    const TABLE: &'static str = "print_tasks";

    fn id(&self) -> crate::DbId {
        self.id
    }

    fn version(&self) -> crate::DbId {
        self.version
    }

    fn version_mut(&mut self) -> &mut crate::DbId {
        &mut self.version
    }
}

pub struct PrintTaskStats {
    printed: u32,
    total: u32,
}

impl PrintTask {
    pub async fn prints_in_progress(
        &self,
        db: &crate::Db
    ) -> Result<u32> {
        let printed = sqlx::query!(
            r#"
                SELECT
                    COUNT(id) as printed
                FROM print_tasks
                WHERE
                    package_id = ?
                    AND part_id = ?
                    AND status IN ("Started", "Paused", "Finished")
            "#,
            &self.package_id,
            &self.part_id,
        )
            .await?
            .printed;
        Ok(printed)
    }

    pub async fn total_quantity_required(
        &self,
        print_id: &crate::DbId,
        db: &crate::Db
    ) -> Result<u32> {
        let quantity = sqlx::query!(
            r#"
                SELECT
                    SUM(quantity) as quantity
                FROM parts
                INNER JOIN packages ON parts.package_id = package.id
                WHERE parts.id = ?
            "#,
            &self.part_id,
        )
            .await?
            .quantity;
        Ok(printed)
    }
}
