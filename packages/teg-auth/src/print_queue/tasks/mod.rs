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

#[path = "mutations/exec_gcodes.mutation.rs"]
pub mod exec_gcodes_mutation;
use exec_gcodes_mutation::ExecGCodesMutation;

#[path = "mutations/spool_job_file.mutation.rs"]
pub mod spool_job_file_mutation;
use spool_job_file_mutation::SpoolJobFileMutation;

#[MergedObject]
pub struct PrintQueueMutation(
    ExecGCodesMutation,
    SpoolJobFileMutation,
);

impl Default for PrintQueueMutation {
    fn default() -> Self {
        Self::new(
            ExecGCodesMutation,
            SpoolJobFileMutation,
        )
    }
}


// impl Default for Mutation {
//     fn default() -> Self {
//         Self(
//             exec_gcodes_mutation::Mutation,
//             spool_job_file_mutation::Mutation,
//         )
//     }
// }
