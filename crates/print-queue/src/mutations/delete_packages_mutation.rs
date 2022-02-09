use chrono::prelude::*;
use async_graphql::{
    ID,
    FieldResult,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use printspool_json_store::{
    Record,
    JsonRow,
};
use printspool_machine::{MachineHooksList, MachineMap, machine::messages::{GetData, StopMachine}, task::{
        Task,
        TaskStatus,
        Cancelled,
    }};

use crate::{
    package::Package,
};

#[derive(Default)]
pub struct DeletePackagesMutation;

#[derive(async_graphql::InputObject)]
struct DeletePackagesInput {
    #[graphql(name="packageIDs")]
    package_ids: Vec<ID>,
}


#[derive(async_graphql::SimpleObject)]
struct DeletedPackages {
    #[graphql(name="packageIDs")]
    package_ids: Vec<ID>,
    #[graphql(name="partIDs")]
    part_ids: Vec<ID>,
}

#[async_graphql::Object]
impl DeletePackagesMutation {
    async fn delete_packages<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: DeletePackagesInput,
    ) -> FieldResult<DeletedPackages> {
        let db: &crate::Db = ctx.data()?;
        let machine_hooks: &MachineHooksList = ctx.data()?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            let now= Utc::now();
            let mut all_packages_tasks = vec![];
            let mut all_packages_parts = vec![];
            let mut tx = db.begin().await?;

            // Verify the package exists
            let mut packages = Package::get_by_ids(
                &mut tx,
                &input.package_ids.into_iter().map(|id| id.0).collect(),
            false,
            ).await?;

            for package in packages.iter_mut() {
                // Cancel all the tasks
                let pending_tasks = sqlx::query_as!(
                    JsonRow,
                    r#"
                        SELECT tasks.props FROM tasks
                        INNER JOIN parts ON parts.id = tasks.part_id
                        WHERE
                            parts.package_id = $1
                            AND tasks.status IN ('spooled', 'started', 'paused')
                    "#,
                    package.id,
                )
                    .fetch_all(&mut tx)
                    .await?;

                let mut pending_tasks = Task::from_rows(pending_tasks)?;

                all_packages_tasks.append(&mut pending_tasks);

                // Soft delete the package
                package.deleted_at = Some(now);
                package.update(&mut tx).await?;

                // Soft delete the parts
                let mut parts = Package::get_parts(
                    &mut tx,
                    &package.id,
                ).await?;

                for mut part in parts.iter_mut() {
                    part.deleted_at = Some(now);
                    part.update(&mut tx).await?;
                }
                all_packages_parts.append(&mut parts);
            }

            tx.commit().await?;

            // Stop any prints (including paused prints)
            for mut task in all_packages_tasks {
                let machine = machines.get(&(&task.machine_id).into())
                    .ok_or_else(||
                        eyre!("machine (ID: {}) not found for package deletion", task.machine_id)
                    )?;

                task.status = TaskStatus::Cancelled(Cancelled {
                    cancelled_at: now,
                });

                let tx = db.begin().await?;
                let machine_data = machine.call(GetData).await??;

                task.settle_task(
                    tx,
                    machine_hooks,
                    &machine_data,
                    machine,
                ).await?;

                machine.call(StopMachine).await?
            }

            Result::<_>::Ok(DeletedPackages {
                part_ids: all_packages_parts.into_iter().map(|part| part.id.into()).collect(),
                package_ids: packages.into_iter().map(|pkg| pkg.id.into()).collect(),
            })
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
