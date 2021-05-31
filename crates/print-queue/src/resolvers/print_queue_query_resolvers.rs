use async_graphql::{
    Context,
    // ID,
    FieldResult,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use teg_json_store::{ Record as _, JsonRow };
use teg_machine::task::Task;

use crate::PrintQueue;
use crate::part::Part;
use super::print_resolvers::Print;

#[derive(async_graphql::InputObject, Debug, Default)]
struct PrintQueuesInput {
    /// Optional filter: Return only the print queues that are associated with the given machine id
    #[graphql(name="machineID", default)]
    machine_id: Option<async_graphql::ID>,
}

#[derive(async_graphql::InputObject, Debug, Default)]
struct LatestPrintsInput {
    /// Optional filter: Return only the prints that are associated with the given machine ids
    #[graphql(name="machineIDs", default)]
    machine_ids: Option<Vec<async_graphql::ID>>,
    /// Optional filter: Return only the prints that are associated with the given print queues
    #[graphql(name="printQueueIDs", default)]
    print_queue_ids: Option<Vec<async_graphql::ID>>,
}

#[derive(Default)]
pub struct PrintQueueQuery;

#[async_graphql::Object]
impl PrintQueueQuery {
    #[instrument(skip(self, ctx))]
    async fn print_queues<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(default)]
        input: PrintQueuesInput,
    ) -> FieldResult<Vec<PrintQueue>> {
        let db: &crate::Db = ctx.data()?;

        async move {
            let mut print_queues = if let Some(machine_id) = input.machine_id {
                let machine_id = machine_id.to_string();

                let print_queues = sqlx::query_as!(
                    JsonRow,
                    r#"
                        SELECT print_queues.props FROM print_queues
                        JOIN machine_print_queues
                            ON machine_print_queues.print_queue_id = print_queues.id
                        WHERE
                            machine_print_queues.machine_id = $1
                    "#,
                    machine_id,
                )
                    .fetch_all(db)
                    .await?;

                PrintQueue::from_rows(print_queues)?
            } else {
                PrintQueue::get_all(db, false).await?
            };

            // Alphabetical and consistent ordering
            print_queues.sort_by_cached_key(|q| (q.name.clone(), q.id.clone()));

            Result::<_>::Ok(print_queues)
        }
            // log the backtrace which is otherwise lost by FieldResult
            .await
            .map_err(|err| {
                warn!("{:?}", err);
                err.into()
            })
    }

    /// Returns the last print task for each machine that has one.
    async fn latest_prints<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        // id: Option<ID>,
        #[graphql(default)]
        input: LatestPrintsInput,
    ) -> FieldResult<Vec<Print>> {
        let db: &crate::Db = ctx.data()?;

        async move {
            let mut args = vec![];
            let mut print_queues_sql_join = "".to_string();
            let mut machine_sql_where_clause = "".to_string();

            if let Some(print_queue_ids) = input.print_queue_ids {
                print_queues_sql_join = format!(
                    r#"
                        INNER JOIN parts ON
                            parts.id = tasks.part_id
                            AND parts.deleted_at IS NULL
                        INNER JOIN packages ON
                            packages.id = parts.package_id
                            AND packages.print_queue_id = ANY(${})
                    "#,
                    args.len() + 1,
                );
                args.push(print_queue_ids);
            };

            if let Some(machine_ids) = input.machine_ids {
                machine_sql_where_clause = format!(
                    r#"
                        AND machine_id = ANY(${})
                    "#,
                    args.len() + 1,
                );
                args.push(machine_ids);
            };

            let sql = format!(
                r#"
                    SELECT results.props FROM (
                        SELECT
                            tasks.id,
                            tasks.props,
                            tasks.created_at
                        FROM tasks
                        {}
                        WHERE
                            tasks.part_id IS NOT NULL
                            {}
                        GROUP BY
                            tasks.id,
                            tasks.props,
                            tasks.created_at
                        ORDER BY
                            tasks.created_at DESC
                        LIMIT 1
                    ) AS results
                    WHERE
                        results.props IS NOT NULL
                "#,
                print_queues_sql_join,
                machine_sql_where_clause,
            );
            let mut query = sqlx::query_as(&sql);

            for arg in args {
                query = query.bind(
                    arg.into_iter().map(|id| id.0.clone()).collect::<Vec<_>>()
                )
            }

            let tasks: Vec<JsonRow> = query
                .fetch_all(db)
                .await?;

            let tasks = Task::from_rows(tasks)?;

            let mut part_ids = tasks.iter()
                .filter_map(|task| task.part_id.clone())
                .collect::<Vec<String>>();
            part_ids.sort();
            part_ids.dedup();

            let parts = sqlx::query_as!(
                JsonRow,
                r#"
                    SELECT props FROM parts
                    WHERE
                        parts.id = ANY($1)
                "#,
                &part_ids,
            )
                .fetch_all(db)
                .await?;
            // let mut parts_query = sqlx::query_as(&parts_sql);

            // for part_id in part_ids {
            //     parts_query = parts_query.bind(part_id)
            // }

            // let parts: Vec<JsonRow> = parts_query
            //     .fetch_all(db)
            //     .await?;

            let parts = Part::from_rows(parts)?;

            let prints = tasks
                .into_iter()
                .map(|task| -> Result<Print> {
                    // Part must be cloned because multiple tasks could reference the same part
                    let part = parts
                        .iter()
                        .find(|part| Some(&part.id) == task.part_id.as_ref())
                        .ok_or_else(|| eyre!("part missing for task ({:?}", task.id))?
                        .clone();

                    Ok(Print {
                        id: task.id.clone().into(),
                        part,
                        task,
                    })
                })
                .collect::<Result<Vec<_>>>()?;

            Result::<_>::Ok(prints)
        }
            // log the backtrace which is otherwise lost by FieldResult
            .await
            .map_err(|err| {
                warn!("{:?}", err);
                err.into()
            })
    }
}
