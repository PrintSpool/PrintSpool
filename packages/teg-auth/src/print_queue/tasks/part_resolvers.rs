use std::sync::Arc;
// use chrono::prelude::*;
use async_graphql::*;

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::models::{
    Part,
    Package,
    Task,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};

#[Object]
impl Part {
    async fn id(&self) -> ID { self.id.into() }
    async fn name(&self) -> &String { &self.name }
    async fn quantity(&self) -> u64 { self.quantity }

    async fn prints_completed(&self) -> u64 { self.printed }

    #[field(name = "totalPrints")]
    async fn total_prints_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<u64> {
        let ctx: &Arc<crate::Context> = ctx.data()?;
        let package = Package::get(&ctx.db, self.package_id)?;

        Ok(self.total_prints(&package))
    }

    async fn prints_queued<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<u64> {
        let ctx: &Arc<crate::Context> = ctx.data()?;
        let package = Package::get(&ctx.db, self.package_id)?;
        let tasks = Task::scan(&ctx.db)
            .filter(|task|
                if let Ok(Task { print: Some(print), .. }) = task {
                    print.part_id == self.id
                } else {
                    true
                }
            )
            .collect::<Result<Vec<Task>>>()?;

        let prints_queued = self.total_prints(&package) - self.printed - (tasks.len() as u64);
        Ok(prints_queued)
    }

    #[field(name = "isDone")]
    async fn is_done_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<bool> {
        let ctx: &Arc<crate::Context> = ctx.data()?;
        let package = Package::get(&ctx.db, self.package_id)?;

        Ok(self.is_done(&package))
    }
}
