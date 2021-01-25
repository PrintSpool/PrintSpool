use async_graphql::{
    Context,
    // ID,
    FieldResult,
};
use teg_json_store::Record;

use crate::PrintQueue;

#[derive(Default)]
pub struct PrintQueueQuery;

#[async_graphql::Object]
impl PrintQueueQuery {
    async fn job_queue<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<PrintQueue> {
        let db: &crate::Db = ctx.data()?;

        // TODO: Support multiple print queues
        let print_queue = PrintQueue::get_all(db).await?.first()
            .unwrap()
            .clone();

        Ok(print_queue)
    }
}
