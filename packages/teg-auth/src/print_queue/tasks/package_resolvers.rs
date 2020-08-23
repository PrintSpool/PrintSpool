use std::sync::Arc;
use chrono::prelude::*;
use async_graphql::*;

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::models::{
    Package,
    Part,
    Task,
    // TaskStatus,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};

fn get_parts(db: &sled::Db, package: &Package) -> Result<Vec<Part>> {
    let parts = Part::scan(&db)
        .filter(|part| {
            if let Ok(part) = part {
                part.print_queue_id == package.id
            } else {
                true
            }
        })
        .collect::<Result<Vec<Part>>>()?;

    Ok(parts)
}

#[Object]
impl Package {
    async fn id(&self) -> ID { self.id.to_string().into() }
    async fn name(&self) -> &String { &self.name }
    async fn quantity(&self) -> u64 { self.quantity }

    async fn files<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Part>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;
        let parts = get_parts(&ctx.db, &self)?;

        Ok(parts)
    }

    async fn tasks<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Task>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let tasks = Task::scan(&ctx.db)
            .filter(|task| {
                match task {
                    Ok(Task { print: Some(print), .. }) => {
                        print.package_id == self.id
                    }
                    Err(_)  => true,
                    _ => false,
                }
            })
            .collect::<Result<Vec<Task>>>()?;

        Ok(tasks)
    }

    async fn prints_completed<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<u64> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let parts = get_parts(&ctx.db, &self)?;

        Ok(self.printed(&parts))
    }

    #[field(name = "totalPrints")]
    async fn total_prints_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<u64> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let parts = get_parts(&ctx.db, &self)?;

        Ok(self.total_prints(&parts))
    }

    #[field(name = "isDone")]
    async fn is_done_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<bool> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let parts = get_parts(&ctx.db, &self)?;

        Ok(self.is_done(&parts))
    }

    // Timestamps
    async fn created_at(&self) -> &DateTime<Utc> { &self.created_at }
}
