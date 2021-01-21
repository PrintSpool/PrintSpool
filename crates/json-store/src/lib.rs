// #[macro_use] extern crate tracing;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = String;

mod saved_record;
pub use saved_record::Record;

mod unsaved_record;
pub use unsaved_record::UnsavedRecord;
