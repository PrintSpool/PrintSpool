#[macro_use] extern crate tracing;
#[macro_use] extern crate nanoid;
#[macro_use] extern crate derive_new;

pub mod mutations;
pub mod package;
pub mod part;
pub mod print;

// mod print_queue;
// pub use print_queue::PrintQueue;

// mod task_from_gcodes;
// pub use task_from_gcodes::{
//     task_from_gcodes,
//     task_from_hook,
// };

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = teg_json_store::DbId;
