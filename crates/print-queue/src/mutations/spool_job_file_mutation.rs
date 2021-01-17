// use std::collections::HashMap;
// use chrono::prelude::*;
// use async_std::prelude::*;

use std::sync::Arc;
use async_graphql::{
    InputObject,
    Object,
    ID,
    FieldResult,
};
// use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    // Result,
    Context as _,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};
use crate::print_queue::tasks::{
    Task,
    // Print,
    // TaskStatus,
    // TaskContent,
    // Part,
};
use crate::machine::models::{
    Machine,
    // MachineStatus,
    // Printing,
};

#[derive(Default)]
pub struct SpoolJobFileMutation;

#[InputObject]
struct SpoolJobFileInput {
    #[field(name="machineID")]
    machine_config_id: ID,
    // TODO: update graphql names to match latest Sled fields
    // #[field(name="partID")]
    #[field(name="jobFileID")]
    part_id: ID,
}


#[Object]
impl SpoolJobFileMutation {
    /// Starts a print by spooling a task to print the job file.
    async fn spool_job_file<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: SpoolJobFileInput,
    ) -> FieldResult<Task> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let part_id = input.part_id.parse::<u64>()
            .with_context(|| format!("Invalid part id: {:?}", input.part_id))?;

        let machine_id = Machine::find(&ctx.db, |m| {
            m.config_id == input.machine_config_id
        })
            .with_context(|| format!("No machine found for ID: {:?}", input.machine_config_id))?
            .id;

        let task = Task::insert_print(
            &ctx,
            machine_id,
            part_id,
            false
        ).await?;

        Ok(task)
    }
}
