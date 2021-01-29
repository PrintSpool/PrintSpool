use chrono::prelude::*;
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
use teg_json_store::Record as _;

use crate::{AuthContext, invite::consume_invite, user::User};
use crate::invite::{
    Invite,
    InviteConfig,
};

// Input Types
// ---------------------------------------------

#[derive(async_graphql::InputObject)]
pub struct CreateInviteInput {
    pub public_key: String,
    pub is_admin: Option<bool>,
}

#[derive(async_graphql::InputObject)]
pub struct UpdateInvite {
    #[graphql(name="inviteID")]
    pub invite_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<InviteConfig>,
}

#[derive(async_graphql::InputObject)]
pub struct DeleteInvite {
    #[graphql(name="inviteID")]
    pub invite_id: ID,
}

// Resolvers
// ---------------------------------------------

#[derive(Default)]
pub struct InviteMutation;

#[async_graphql::Object]
impl InviteMutation {
    async fn create_invite<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: CreateInviteInput,
    ) -> FieldResult<Invite> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let invite = Invite {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            config: InviteConfig {
                is_admin: input.is_admin.unwrap_or(false),
            },
            public_key: input.public_key,
            private_key: None,
            slug: None,
        };

        invite.insert(db).await?;

        Ok(invite)
    }

    async fn update_invite<'ctx>(&self, ctx: &'ctx Context<'_>, input: UpdateInvite) -> FieldResult<Invite> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let mut invite = Invite::get_with_version(
            db,
            &input.invite_id,
            input.model_version,
        ).await?;

        invite.config = input.model.0;

        invite.update(db).await?;

        Ok(invite)
    }

    async fn delete_invite<'ctx>(&self, ctx: &'ctx Context<'_>, input: DeleteInvite) -> FieldResult<Option<bool>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let DeleteInvite { invite_id } = input;
        let invite_id = invite_id.to_string();

        Invite::remove(db, &invite_id)
            .await
            .with_context(|| "Error deleting invite")?;

        Ok(None)
    }

    async fn consume_invite<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
    ) -> FieldResult<User> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;
        let user = auth.allow_unauthorized_user()?;

        let invite_public_key = auth.identity_public_key
            .as_ref()
            .ok_or_else(||
                eyre!("identity_public_key must be sent in connection initialization")
            )?;

        let user = consume_invite(db, invite_public_key, user).await?;

        Ok(user)
    }
}
