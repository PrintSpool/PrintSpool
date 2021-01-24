use chrono::prelude::*;
use async_graphql::{
    ID,
    FieldResult,
};
use anyhow::{
    anyhow,
    // Result,
    // Context as _,
};
use teg_json_store::{
    Record,
    JsonRow,
};
use teg_machine::{
    MachineMap,
    // machine::{
    //     Machine,
    //     MachineStatus,
    //     Printing,
    // },
    task::{
        Task,
        TaskStatus,
        Cancelled,
    },
    machine::messages::{
        StopMachine,
    },
};

use crate::{
    // part::Part,
    package::Package,
};

#[derive(Default)]
pub struct DeleteJobMutation;

#[derive(async_graphql::InputObject)]
struct DeleteJobInput {
    // TODO: update graphql names to match latest Sled fields
    #[graphql(name="jobID")]
    package_id: ID,
}

#[async_graphql::Object]
impl DeleteJobMutation {
    /// create a Job from the content and fileName of a file upload.
    async fn delete_job<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: DeleteJobInput,
    ) -> FieldResult<Option<bool>> {
        let db: &crate::Db = ctx.data()?;
        let mut tx = db.begin().await?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        let package_id = input.package_id.to_string();
        // Verify the package exists
        let mut package = Package::get(&mut tx, &package_id).await?;

        // Cancel all the tasks
        let pending_tasks = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT tasks.props FROM tasks
                INNER JOIN parts ON parts.id = tasks.part_id
                WHERE
                    parts.package_id = ?
                    AND tasks.status IN ('spooled', 'started', 'paused')
            "#,
            package_id,
        )
            .fetch_all(&mut tx)
            .await?;

        let tasks = Task::from_rows(pending_tasks)?;

        for mut task in tasks.clone() {
            task.status = TaskStatus::Cancelled(Cancelled {
                cancelled_at: Utc::now(),
            });
            task.update(&mut tx).await;
        }

        // Soft delete the package
        package.deleted_at = Some(Utc::now());
        package.insert_no_rollback(&mut tx).await?;

        tx.commit().await?;

        // Stop any prints (including paused prints)
        for task in tasks {
            let machine = machines.get(&(&task.machine_id).into())
                .ok_or_else(||
                    anyhow!("machine (ID: {}) not found for package deletion", task.machine_id)
                )?;

            machine.call(StopMachine).await?
        }

        Ok(None)
    }
}
