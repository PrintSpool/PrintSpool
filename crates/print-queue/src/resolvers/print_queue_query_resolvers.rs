use async_graphql::{
    Context,
    // ID,
    FieldResult,
};
use teg_json_store::{ Record as _, JsonRow };

use crate::PrintQueue;

#[derive(async_graphql::InputObject, Default)]
struct PrintQueuesInput {
    /// Optional filter: Return only the print queues that are associated with the given machine id
    machine_id: Option<async_graphql::ID>,
}

#[derive(Default)]
pub struct PrintQueueQuery;

#[async_graphql::Object]
impl PrintQueueQuery {
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
}
