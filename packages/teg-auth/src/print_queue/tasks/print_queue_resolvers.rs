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

    async fn jobs<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Package>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let parts = Package::scan(&ctx.db)
            // TODO: Migrate away from packages as the unit of work in the job queue
            // .filter(|package| {
            //     if let Ok(package) = package {
            //         package.print_queue_id == self.id
            //     } else {
            //         true
            //     }
            // })
            .collect::<Result<Vec<Package>>>()?;

        Ok(parts)
    }
}
