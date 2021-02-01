#[macro_use] extern crate tracing;
#[macro_use] extern crate nanoid;

pub mod invite;
pub use invite::resolvers::{
    mutation_resolvers::InviteMutation,
    query_resolvers::InviteQuery,
};

pub mod user;
pub use user::resolvers::{
    mutation_resolvers::UserMutation,
    query_resolvers::UserQuery,
};

mod signal;
pub use signal::Signal;

// mod watch_pem_keys;
// pub use watch_pem_keys::watch_pem_keys;

mod auth_context;
pub use auth_context::AuthContext;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = teg_json_store::DbId;
