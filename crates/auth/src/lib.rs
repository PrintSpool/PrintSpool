#[macro_use]
extern crate tracing;
#[macro_use]
extern crate nanoid;

mod auth_context;
mod create_signalling_jwt;
pub mod invite;
mod server_keys;
mod signal;
pub mod user;

pub use invite::resolvers::{
    invite_mutation_resolvers::InviteMutation, invite_query_resolvers::InviteQuery,
};
pub use printspool_common::paths;
pub use server_keys::ServerKeys;
pub use signal::Signal;
pub use user::resolvers::{user_mutation_resolvers::UserMutation, user_query_resolvers::UserQuery};
// mod watch_pem_keys;
// pub use watch_pem_keys::watch_pem_keys;
pub use auth_context::AuthContext;

pub type Db = sqlx::PgPool;
pub type DbId = printspool_json_store::DbId;
