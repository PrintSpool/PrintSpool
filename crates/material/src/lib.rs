#[macro_use] extern crate nanoid;

mod material;
pub use material::*;

pub mod resolvers;

mod into_config_form;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = teg_json_store::DbId;
