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

// Resolvers
mod package_resolvers;
mod part_resolvers;
mod print_queue_resolvers;
pub mod query_resolvers;
mod task_resolvers;

#[path = "mutations/exec_gcodes.mutation.rs"]
pub mod exec_gcodes_mutation;
use exec_gcodes_mutation::ExecGCodesMutation;

#[path = "mutations/spool_job_file.mutation.rs"]
pub mod spool_job_file_mutation;
use spool_job_file_mutation::SpoolJobFileMutation;

#[path = "mutations/create_job.mutation.rs"]
pub mod create_job_mutation;
use create_job_mutation::CreateJobMutation;

#[path = "mutations/delete_job.mutation.rs"]
pub mod delete_job_mutation;
use delete_job_mutation::DeleteJobMutation;

#[path = "mutations/set_job_position.mutation.rs"]
pub mod set_job_position_mutation;
use set_job_position_mutation::SetJobPositionMutation;

#[MergedObject]
pub struct PrintQueueMutation(
    ExecGCodesMutation,
    SpoolJobFileMutation,
    CreateJobMutation,
    DeleteJobMutation,
    SetJobPositionMutation,
);

impl Default for PrintQueueMutation {
    fn default() -> Self {
        Self::new(
            ExecGCodesMutation,
            SpoolJobFileMutation,
            CreateJobMutation,
            DeleteJobMutation,
            SetJobPositionMutation,
        )
    }
}
