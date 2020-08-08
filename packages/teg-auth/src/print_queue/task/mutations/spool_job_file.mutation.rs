// use std::collections::HashMap;
// use chrono::prelude::*;
use async_graphql::*;
// use serde::{Deserialize, Serialize};

// use super::revisions::*;

pub struct Query;
pub struct Mutation;

#[Object]
impl Query {
}

#[Object]
impl Mutation {
    // /// Starts a print by spooling a task to print the job file.
    // async fn spool_job_file(input: SpoolJobFileInput, context: &crate::Context) -> Task {
    //     // TODO
    //     let task = TaskBuilder::build();

    //     let task = task::insert(&context.db);

    //     task
    // }
}

#[InputObject]
struct SpoolJobFileInput {
    #[field(name="machineID")]
    machine_id: ID,
    // #[field(name="partID")]
    #[field(name="jobFileID")]
    part_id: ID,
}
