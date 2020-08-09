// use std::collections::HashMap;
// use chrono::prelude::*;
use async_graphql::*;
// use serde::{Deserialize, Serialize};

use super::Task;

pub struct SpoolJobFileMutation;

#[Object]
impl SpoolJobFileMutation {
    /// Starts a print by spooling a task to print the job file.
    async fn spool_job_file<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: SpoolJobFileInput,
    // ) -> FieldResult<()> {
    ) -> FieldResult<Option<Task>> {
        Ok(None)
    //     // TODO
    //     let task = TaskBuilder::build();

    //     let task = task::insert(&context.db);

    //     task
    }
}

#[InputObject]
struct SpoolJobFileInput {
    #[field(name="machineID")]
    machine_id: ID,
    // TODO: update graphql names to match latest Sled fields
    // #[field(name="partID")]
    #[field(name="jobFileID")]
    part_id: ID,
}
