use chrono::prelude::*;
use async_graphql::{
    ID,
    FieldResult,
};
use eyre::{
    eyre,
    // Result,
    // Context as _,
};
use teg_json_store::{
    Record,
    JsonRow,
};
use teg_machine::{
    MachineMap,
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
    package::Package,
};

#[derive(Default)]
pub struct DeletePackageMutation;

#[derive(async_graphql::InputObject)]
struct DeletePackageInput {
    #[graphql(name="packageID")]
    package_id: ID,
}

#[async_graphql::Object]
impl DeletePackageMutation {
    async fn delete_package<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: DeletePackageInput,
    ) -> FieldResult<Option<teg_common::Void>> {
        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        let now= Utc::now();
        let package_id = input.package_id.0;

        let db: &crate::Db = ctx.data()?;
        let mut tx = db.begin().await?;

        // Verify the package exists
        let mut package = Package::get(
            &mut tx,
            &package_id,
        false,
        ).await?;

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

        let mut tasks = Task::from_rows(pending_tasks)?;

        for mut task in &mut tasks {
            task.status = TaskStatus::Cancelled(Cancelled {
                cancelled_at: now,
            });
            task.settle_task().await;
            task.update(&mut tx).await?;
        }

        // Soft delete the package
        package.deleted_at = Some(now);
        package.update(&mut tx).await?;

        // Soft delete the parts
        let parts = Package::get_parts(&mut tx, &package.id).await?;
        for mut part in parts {
            part.deleted_at = Some(now);
            part.update(&mut tx).await?;
        }

        tx.commit().await?;

        // Stop any prints (including paused prints)
        for task in tasks {
            let machine = machines.get(&(&task.machine_id).into())
                .ok_or_else(||
                    eyre!("machine (ID: {}) not found for package deletion", task.machine_id)
                )?;

            machine.call(StopMachine).await?
        }

        Ok(None)
    }
}
