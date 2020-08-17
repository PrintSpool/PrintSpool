use std::sync::Arc;
// use chrono::prelude::*;
use async_graphql::*;

use super::models::{
    PrintQueue,
    // Task,
    // TaskStatus,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};

pub struct PrintQueueQuery;

#[Object]
impl PrintQueueQuery {
    async fn job_queue<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<PrintQueue> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let print_queue = PrintQueue::first(&ctx.db)?;

        Ok(print_queue)
    }
}
