// use std::collections::HashMap;
// use chrono::prelude::*;
use async_graphql::GQLMergedObject;
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

pub mod create_job_mutation;
use create_job_mutation::CreateJobMutation;

pub mod delete_job_mutation;
use delete_job_mutation::DeleteJobMutation;

pub mod exec_gcodes_mutation;
use exec_gcodes_mutation::ExecGCodesMutation;

pub mod pause_print_mutation;
use pause_print_mutation::PausePrintMutation;

pub mod resume_print_mutation;
use resume_print_mutation::ResumePrintMutation;

pub mod set_job_position_mutation;
use set_job_position_mutation::SetJobPositionMutation;

pub mod spool_job_file_mutation;
use spool_job_file_mutation::SpoolJobFileMutation;

#[derive(async_graphql::MergedObject, Default)]
pub struct PrintQueueMutation(
    CreateJobMutation,
    DeleteJobMutation,
    ExecGCodesMutation,
    PausePrintMutation,
    ResumePrintMutation,
    SetJobPositionMutation,
    SpoolJobFileMutation,
);
