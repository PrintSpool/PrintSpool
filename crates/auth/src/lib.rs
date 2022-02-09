#[macro_use] extern crate tracing;
#[macro_use] extern crate nanoid;

pub mod invite;
pub use invite::resolvers::{
    invite_mutation_resolvers::InviteMutation,
    invite_query_resolvers::InviteQuery,
};

pub mod user;
pub use user::resolvers::{
    user_mutation_resolvers::UserMutation,
    user_query_resolvers::UserQuery,
};

mod signal;
pub use signal::Signal;

mod create_signalling_jwt;
mod server_keys;
pub use server_keys::ServerKeys;

pub use printspool_common::paths;

// mod watch_pem_keys;
// pub use watch_pem_keys::watch_pem_keys;

mod auth_context;
pub use auth_context::AuthContext;

pub type Db = sqlx::PgPool;
pub type DbId = printspool_json_store::DbId;
