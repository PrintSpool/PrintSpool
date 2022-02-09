use chrono::prelude::*;
use async_graphql::{
    ID,
    FieldResult,
    Context,
};
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };
use printspool_machine::task::Task;

use crate::{
    package::Package,
    part::Part,
};

#[async_graphql::Object]
impl Package {
    async fn id(&self) -> ID { (&self.id).into() }
    async fn name(&self) -> &String { &self.name }
    async fn quantity(&self) -> i32 { self.quantity }

    async fn starred(&self) -> bool { self.starred || self.based_on_package_id.is_some() }

    #[graphql(name="printQueueID")]
    async fn print_queue_id(&self) -> ID { (&self.print_queue_id).into() }

    async fn parts<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Part>> {
        let db: &crate::Db = ctx.data()?;
        let parts = Self::get_parts(db, &self.id).await?;

        Ok(parts)
    }

    async fn tasks<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Task>> {
        let db: &crate::Db = ctx.data()?;
        let tasks = Self::get_tasks(db, &self.id).await?;

        Ok(tasks)
    }

    async fn prints_completed<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<i64> {
        let db: &crate::Db = ctx.data()?;

        Ok(Self::query_prints_completed(db, &self.id).await?)
    }

    async fn total_prints_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<i64> {
        let db: &crate::Db = ctx.data()?;

        Ok(Self::query_total_prints(db, &self.id).await?)
    }

    async fn is_done_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<bool> {
        let db: &crate::Db = ctx.data()?;

        Ok(Self::started_final_print(db, &self.id).await?)
    }

    // Timestamps
    async fn created_at(&self) -> &DateTime<Utc> { &self.created_at }
}
