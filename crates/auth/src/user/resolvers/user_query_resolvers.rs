use async_graphql::{
    FieldResult,
    Context,
    ID,
};
use printspool_json_store::Record as _;

use crate::{
    AuthContext,
    user::User,
};

#[derive(async_graphql::InputObject, Default, Debug)]
pub struct UsersInput {
    #[graphql(name="userID")]
    pub user_id: Option<ID>,
}

#[derive(Default)]
pub struct UserQuery;

#[async_graphql::Object]
impl UserQuery {
    #[instrument(skip(self, ctx))]
    async fn users<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(default)]
        input: UsersInput,
    ) -> FieldResult<Vec<User>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let mut users = if let Some(user_id) = input.user_id {
            let user = User::get(
                db,
                &user_id.0,
                false,
            ).await?;
            vec![user]
        } else {
            User::get_all(
                db,
                false
            ).await?
        };

        users.sort_by_cached_key(|user| {
            (!user.is_local_http_user, user.email.clone(), user.id.clone())
        });

        Ok(users)
    }
}
