use std::sync::Arc;
use async_graphql::{
    ID,
    InputObject,
    Object,
    FieldResult,
};
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};

use crate::{
    part::Part,
    package::Package,
};
use teg_machine::{machine::{
    Machine,
    MachineStatus,
    Printing,
}, task::TaskStatus};

#[derive(Default)]
pub struct DeleteJobMutation;

#[derive(async_graphql::InputObject)]
struct DeleteJobInput {
    // TODO: update graphql names to match latest Sled fields
    #[field(name="jobID")]
    package_id: ID,
}

#[Object]
impl DeleteJobMutation {
    /// create a Job from the content and fileName of a file upload.
    async fn delete_job<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: DeleteJobInput,
    ) -> FieldResult<Option<bool>> {
        let db: &crate::Db = ctx.data()?;
        let mut tx = db.begin().await?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let package_id = input.package_id.to_string();
        // Verify the package exists
        let package = Package::get(&mut tx, &package_id).await?;

        // EStop any prints (including paused prints)
        let pending_tasks = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM tasks
                WHERE
                    parts.package_id = ?
                    tasks.status IN ('spooled', 'started', 'paused')
            "#,
            package_id,
        )
            .fetch_all(&tx)
            .await;

        // Stop any prints (including paused prints)
        for task in Task::from_rows(pending_tasks) {
            task.status = TaskStatus::Cancelled;
            
            let machine = machines.get(&task.machine_id.into())
                .ok_or_else(||
                    anyhow!("machine (ID: {}) not found for package deletion", task.machine_id)
                )?;

            machine.call(StopMachine).await?
        }


        // Soft delete the package
        package.deleted_at = Utc::now();
        package.insert(&mut tx);

        tx.commit().await?;

        let _: Vec<Part> = ctx.db.transaction(|db| {
            Package::remove(&db, package_id)?;

            // Delete each part
            let parts= part_ids.clone()
                .iter()
                .filter_map(|part_id| Part::remove(&db, *part_id).transpose())
                .collect::<VersionedModelResult<Vec<Part>>>()?;

            // Delete each task
            let tasks= task_ids.clone()
                .iter()
                .filter_map(|task_id| Task::remove(&db, *task_id).transpose())
                .collect::<VersionedModelResult<Vec<Task>>>()?;

            // Stop any running prints associated with this package
            tasks.iter()
                .map(|task| task.machine_id)
                .collect::<std::collections::HashSet<u64>>()
                .iter()
                .map(|machine_id| Machine::stop(&db, *machine_id).map_err(Into::into))
                .collect::<VersionedModelResult<Vec<_>>>()?;

            Ok(parts)
        })?;


        let mut all_parts = Part::scan(&ctx.db)
            .collect::<Result<Vec<Part>>>()?;

        all_parts.sort_by_key(|part| part.position);

        // Update part positions to fill in any holes
        ctx.db.transaction(|db| {
            for (index, mut part) in all_parts.clone().into_iter().enumerate() {
                if part.position != index as u64 {
                    part.position = index as u64;
                    part.insert(&db)?;
                }
            }

            Ok(())
        })?;

        ctx.db.flush_async().await
            .with_context(|| "Error saving job to the database")?;

        Ok(None)
    }
}
