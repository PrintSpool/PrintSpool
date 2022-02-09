use async_graphql::{
    FieldResult,
    ID,
    Context,
};
use eyre::{
    Context as _,
    eyre,
    // Result
};
use printspool_json_store::Record as _;

use crate::{AuthContext, user::{User, UserConfig}};

// Input Types
// ---------------------------------------------

#[derive(async_graphql::InputObject)]
pub struct UpdateUserInput {
    #[graphql(name="userID")]
    pub user_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<UserConfig>,
}

#[derive(async_graphql::InputObject)]
pub struct DeleteUserInput {
    #[graphql(name="userID")]
    pub user_id: ID,
}

// Resolvers
// ---------------------------------------------

#[derive(Default)]
pub struct UserMutation;

#[async_graphql::Object]
impl UserMutation {
    async fn update_user<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: UpdateUserInput,
    ) -> FieldResult<User> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let mut tx = db.begin().await?;

        if input.model.0.is_admin == false {
            User::verify_other_admins_exist(&mut tx, &input.user_id)
                .await
                .with_context(|| r#"
                    Cannot remove admin permissions from last admin.
                    Please add another administrator.
                "#)?;
        }

        let mut user = User::get_with_version(
            &mut tx,
            &input.user_id,
            input.model_version,
            false,
        ).await?;

        user.config = input.model.0;

        user.update(&mut tx).await?;
        tx.commit().await?;

        Ok(user)
    }

    async fn delete_user<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: DeleteUserInput,
    ) -> FieldResult<Option<printspool_common::Void>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let mut tx = db.begin().await?;
        // Verify that there will be at least one admin in the database after this user is
        // removed.
        User::verify_other_admins_exist(&mut tx, &input.user_id)
            .await
            .with_context(|| r#"
                Cannot delete only admin user.
                Please add another administrator before deleting this user.
            "#)?;

        let mut user = User::get(
            &mut tx,
            &input.user_id.0,
            true,
        ).await?;

        if user.is_local_http_user {
            Err(eyre!("This account is required to run the server"))?;
        }

        user.remove(&mut tx, false).await?;
        tx.commit().await?;

        Ok(None)
    }
}
