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
    async fn print_queues<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
    ) -> FieldResult<Vec<PrintQueue>> {
        let db: &crate::Db = ctx.data()?;

        let print_queues = PrintQueue::get_all(db).await?;

        Ok(print_queues)
    }
}
