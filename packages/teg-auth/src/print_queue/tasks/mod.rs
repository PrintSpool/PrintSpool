// use std::collections::HashMap;
// use chrono::prelude::*;
// use async_graphql::*;
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
mod exec_gcodes_mutation;

#[path = "mutations/spool_job_file.mutation.rs"]
mod spool_job_file_mutation;

// pub struct Query;
// pub struct Mutation;

// TODO: combine resolvers
