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
        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        let db: &crate::Db = ctx.data()?;

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
                            parts.package_id = ?
                            AND tasks.status IN ('spooled', 'started', 'paused')
                    "#,
                    package.id,
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
                all_packages_tasks.append(&mut tasks);

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
            for task in all_packages_tasks {
                let machine = machines.get(&(&task.machine_id).into())
                    .ok_or_else(||
                        eyre!("machine (ID: {}) not found for package deletion", task.machine_id)
                    )?;

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
