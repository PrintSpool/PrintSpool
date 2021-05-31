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
use teg_machine::{MachineHooksList, MachineMap, machine::messages::{GetData, StopMachine}, task::{
        Task,
        TaskStatus,
        Cancelled,
    }};

use crate::{
    part::Part,
};

#[derive(Default)]
pub struct DeletePartsMutation;

#[derive(async_graphql::InputObject)]
struct DeletePartsInput {
    #[graphql(name="partIDs")]
    part_ids: Vec<ID>,
}

#[derive(async_graphql::SimpleObject)]
struct DeletedParts {
    #[graphql(name="partIDs")]
    part_ids: Vec<ID>,
}


#[async_graphql::Object]
impl DeletePartsMutation {
    async fn delete_parts<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: DeletePartsInput,
    ) -> FieldResult<DeletedParts> {
        let db: &crate::Db = ctx.data()?;
        let machine_hooks: &MachineHooksList = ctx.data()?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            let mut tx = db.begin().await?;

            let part_ids = input.part_ids
                .iter()
                .map(|id| id.0.clone())
                .collect::<Vec<_>>();

            // Verify the parts exist
            let parts = Part::get_by_ids(
                &mut tx,
                &part_ids,
                false,
            ).await?;

            // Cancel all the tasks
            let tasks = sqlx::query_as!(
                JsonRow,
                r#"
                    SELECT tasks.props as "props!" FROM tasks
                    INNER JOIN parts ON parts.id = tasks.part_id
                    WHERE
                        parts.id = ANY($1)
                        AND tasks.status IN ('spooled', 'started', 'paused')
                "#,
                &part_ids,
            )
                .fetch_all(&mut tx)
                .await?;

            let mut tasks = Task::from_rows(tasks)?;

            // Soft delete the package
            let now= Utc::now();
            for mut part in parts {
                part.deleted_at = Some(now.clone());
                part.update(&mut tx).await?;
            }

            tx.commit().await?;

            for mut task in &mut tasks {
                let machine = machines.get(&(&task.machine_id).into())
                    .ok_or_else(||
                        eyre!(
                            "machine ({:?}) not found for task ({:?})",
                            task.machine_id,
                            task.id,
                        )
                    )?;

                task.status = TaskStatus::Cancelled(Cancelled {
                    cancelled_at: Utc::now(),
                });

                let tx = db.begin().await?;
                let machine_data = machine.call(GetData).await??;

                task.settle_task(
                    tx,
                    machine_hooks,
                    &machine_data,
                    &machine,
                ).await?;
            }

            // Stop any prints (including paused prints)
            for task in tasks {
                let machine = machines.get(&(&task.machine_id).into())
                    .ok_or_else(||
                        eyre!("machine (ID: {}) not found for package deletion", task.machine_id)
                    )?;

                machine.call(StopMachine).await?
            }

            Result::<_>::Ok(DeletedParts {
                part_ids: input.part_ids,
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
