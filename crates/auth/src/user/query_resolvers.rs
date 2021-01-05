use async_graphql::{
    FieldResult,
    Context,
    // ID,
};
// use anyhow::{Context as _, Result};

use crate::{
    AuthContext,
};
use super::{
    User,
};

pub struct Query();

#[async_graphql::Object]
impl Query {
    async fn users<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<User>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let users = User::get_all(db).await?;

        Ok(users)
    }
}
