#[macro_use] extern crate tracing;

pub mod print;

pub mod print_completion_loop;
pub mod part_deletion_watcher;

mod task_from_gcodes;
pub use task_from_gcodes::{
    task_from_gcodes,
    task_from_hook,
};

pub mod mutations;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = i32;
