// #[macro_use] extern crate tracing;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = String;
pub type Version = i32;

mod record;
pub use record::Record;
