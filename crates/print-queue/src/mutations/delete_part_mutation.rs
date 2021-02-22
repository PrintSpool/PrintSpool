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
    part::Part,
};

#[derive(Default)]
pub struct DeletePartMutation;

#[derive(async_graphql::InputObject)]
struct DeletePartInput {
    #[graphql(name="partID")]
    part_id: ID,
}

#[async_graphql::Object]
impl DeletePartMutation {
    async fn delete_part<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: DeletePartInput,
    ) -> FieldResult<Option<teg_common::Void>> {
        let db: &crate::Db = ctx.data()?;
        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            let mut tx = db.begin().await?;

            let part_id = input.part_id.to_string();
            // Verify the part exists
            let mut part = Part::get(&mut tx, &part_id).await?;

            // Cancel all the tasks
            let pending_tasks = sqlx::query_as!(
                JsonRow,
                r#"
                    SELECT tasks.props FROM tasks
                    INNER JOIN parts ON parts.id = tasks.part_id
                    WHERE
                        parts.id = ?
                        AND tasks.status IN ('spooled', 'started', 'paused')
                "#,
                part_id,
            )
                .fetch_all(&mut tx)
                .await?;

            let mut tasks = Task::from_rows(pending_tasks)?;

            for mut task in &mut tasks {
                task.status = TaskStatus::Cancelled(Cancelled {
                    cancelled_at: Utc::now(),
                });
                task.settle_task().await;
                task.update(&mut tx).await?;
            }

            // Soft delete the package
            let now= Utc::now();
            part.deleted_at = Some(now.clone());
            part.update(&mut tx).await?;

            tx.commit().await?;

            // Stop any prints (including paused prints)
            for task in tasks {
                let machine = machines.get(&(&task.machine_id).into())
                    .ok_or_else(||
                        eyre!("machine (ID: {}) not found for package deletion", task.machine_id)
                    )?;

                machine.call(StopMachine).await?
            }

            Result::<_>::Ok(None)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
