mod material;

pub use material::*;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = i32;
