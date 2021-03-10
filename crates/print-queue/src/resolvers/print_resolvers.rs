use teg_machine::task::Task;

use crate::{
    part::Part,
    // package::Package,
};

// Wrapper to associate a task to a part. If async-graphql adds support for referencing types
// from external crates (think like an inter-crate federation) then this can be replaced with
// a `task.part` field.
#[derive(async_graphql::SimpleObject)]
pub struct Print {
    pub part: Part,
    pub task: Task,
}
