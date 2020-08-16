// use std::collections::HashMap;
// use chrono::prelude::*;
use async_graphql::MergedObject;
// use serde::{Deserialize, Serialize};

// use crate::{
//     Query,
//     Mutation
// };

mod models;
pub use models::*;

#[path = "task.resolvers.rs"]
mod task_resolvers;

#[path = "package.resolvers.rs"]
mod package_resolvers;

#[path = "mutations/exec_gcodes.mutation.rs"]
pub mod exec_gcodes_mutation;
use exec_gcodes_mutation::ExecGCodesMutation;

#[path = "mutations/spool_job_file.mutation.rs"]
pub mod spool_job_file_mutation;
use spool_job_file_mutation::SpoolJobFileMutation;

#[path = "mutations/create_job.mutation.rs"]
pub mod create_job_mutation;
use create_job_mutation::CreateJobMutation;

// #[path = "mutations/delete_job.mutation.rs"]
// pub mod delete_job;

// #[path = "mutations/set_job_position.mutation.rs"]
// pub mod set_job_position;

#[MergedObject]
pub struct PrintQueueMutation(
    ExecGCodesMutation,
    SpoolJobFileMutation,
    CreateJobMutation,
);

impl Default for PrintQueueMutation {
    fn default() -> Self {
        Self::new(
            ExecGCodesMutation,
            SpoolJobFileMutation,
            CreateJobMutation,
        )
    }
}
