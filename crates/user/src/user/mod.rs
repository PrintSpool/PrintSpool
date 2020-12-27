use async_graphql::*;

mod authenticate;
pub use authenticate::*;

pub mod jwt;

mod user;
pub use user::{
    User,
    UnsavedUser,
};


mod user_config;
pub use user_config::UserConfig;

pub mod query_resolvers;
mod user_resolvers;

#[derive(async_graphql::InputObject)]
pub struct UpdateUser {
    #[graphql(name="userID")]
    pub user_id: ID,
    pub is_admin: Option<bool>,
}

#[derive(async_graphql::InputObject)]
pub struct DeleteUser {
    #[graphql(name="userID")]
    pub user_id: ID,
}