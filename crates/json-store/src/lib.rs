// #[macro_use] extern crate tracing;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = i32;

mod saved_record;
pub use saved_record::Record;

mod unsaved_record;
pub use unsaved_record::UnsavedRecord;
