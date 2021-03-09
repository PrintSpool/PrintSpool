use async_graphql::*;

mod authenticate;
pub use authenticate::*;

mod configurable_user;

// pub mod jwt;

mod user;
pub use user::{
    User,
};


mod user_config;
pub use user_config::UserConfig;

pub mod resolvers;

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
