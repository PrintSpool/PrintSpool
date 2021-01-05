#[macro_use] extern crate tracing;

pub mod invite;
pub mod user;
pub mod data_channel;

mod auth_context;
pub use auth_context::AuthContext;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = i32;
