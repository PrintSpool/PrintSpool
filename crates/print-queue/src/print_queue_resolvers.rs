use std::sync::Arc;
// use chrono::prelude::*;
use async_graphql::*;

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::models::{
    PrintQueue,
    Package,
    Part,
};

// use crate::machine::models::{
//     Machine,
// };

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};

#[Object]
impl PrintQueue {
    async fn id(&self) -> ID { self.id.into() }

    async fn name<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<String> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let config = ctx.machine_config.load();

        Ok(config.name()?)
    }

    async fn jobs<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: Option<ID>,
    ) -> FieldResult<Vec<Package>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let packages = if let Some(id) = id {
            let package = Package::get(&ctx.db, id.parse()?)?;

            vec![package]
        } else {
            let parts = Part::scan(&ctx.db)
                .collect::<Result<Vec<Part>>>()?;

            let mut packages = Package::scan(&ctx.db)
                // TODO: Migrate away from packages as the unit of work in the job queue
                // .filter(|package| {
                //     if let Ok(package) = package {
                //         package.print_queue_id == self.id
                //     } else {
                //         true
                //     }
                // })
                .collect::<Result<Vec<Package>>>()?;

            packages.sort_by_cached_key(|package| {
                parts
                    .iter()
                    .find(|part| part.package_id == package.id)
                    .map(|part| part.position)
                    .unwrap_or(u64::MAX)
            });

            packages
        };

        Ok(packages)
    }
}
