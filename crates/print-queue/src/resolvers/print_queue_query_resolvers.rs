use async_graphql::{
    Context,
    // ID,
    FieldResult,
};
use teg_json_store::{ Record as _, JsonRow };
use teg_machine::task::Task;

use crate::PrintQueue;

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

        let mut print_queues = if let Some(machine_id) = input.machine_id {
            let machine_id = machine_id.to_string();

            let print_queues = sqlx::query_as!(
                JsonRow,
                r#"
                    SELECT print_queues.props FROM print_queues
                    JOIN machine_print_queues
                        ON machine_print_queues.print_queue_id = print_queues.id
                    WHERE
                        machine_print_queues.machine_id = ?
                "#,
                machine_id,
            )
                .fetch_all(db)
                .await?;

            PrintQueue::from_rows(print_queues)?
        } else {
            PrintQueue::get_all(db).await?
        };

        // Alphabetical and consistent ordering
        print_queues.sort_by_cached_key(|q| (q.name.clone(), q.id.clone()));

        Ok(print_queues)
    }

    /// Returns the last print task for each machine that has one.
    async fn latest_prints<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        // id: Option<ID>,
        #[graphql(default)]
        input: LatestPrintsInput,
    ) -> FieldResult<Vec<Task>> {
        let db: &crate::Db = ctx.data()?;

        let mut args = vec![];
        let mut print_queues_sql_join = "".to_string();
        let mut machine_sql_where_clause = "".to_string();

        if let Some(mut print_queue_ids) = input.print_queue_ids {
            print_queues_sql_join = format!(
                r#"
                    INNER JOIN parts ON
                        parts.id = tasks.part_id
                        AND parts.deleted_at IS NULL
                    INNER JOIN packages ON
                        packages.id = parts.package_id
                        AND packages.print_queue_id IN ({})
                "#,
                print_queue_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", "),
            );
            args.append(&mut print_queue_ids);
        };

        if let Some(mut machine_ids) = input.machine_ids {
            machine_sql_where_clause = format!(
                r#"
                    AND machine_id IN ({})
                "#,
                machine_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", "),
            );
            args.append(&mut machine_ids);
        };

        let sql = format!(
            r#"
                SELECT results.props FROM (
                    SELECT
                        tasks.props,
                        MAX(tasks.created_at)
                    FROM tasks
                    {}
                    WHERE
                        tasks.part_id IS NOT NULL
                        {}
                ) AS results
            "#,
            print_queues_sql_join,
            machine_sql_where_clause,
        );
        let mut query = sqlx::query_as(&sql);

        for arg in args {
            query = query.bind(arg.0)
        }

        let tasks: Vec<JsonRow> = query
            .fetch_all(db)
            .await?;

        let tasks = Task::from_rows(tasks)?;

        Ok(tasks)
    }
}
