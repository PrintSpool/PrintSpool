use std::sync::Arc;
use async_graphql::{
    FieldResult,
    ID,
    Context,
};
use eyre::{
    Context as _,
    // eyre,
    // Result
};
use teg_json_store::Record as _;

use crate::{AuthContext, ServerKeys};
use crate::invite::{
    Invite,
    InviteConfig,
};

// Input Types
// ---------------------------------------------

#[derive(async_graphql::InputObject)]
pub struct CreateInviteInput {
    pub model: async_graphql::Json<InviteConfig>,
}

#[derive(async_graphql::SimpleObject)]
pub struct CreateInvite {
    pub id: ID,
    pub invite: Invite,
    /// Link to consume the invite. Only generated once for each invite.
    #[graphql(name = "inviteURL")]
    pub invite_url: String,
}

#[derive(async_graphql::InputObject)]
pub struct UpdateInviteInput {
    #[graphql(name="inviteID")]
    pub invite_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<InviteConfig>,
}

#[derive(async_graphql::InputObject)]
pub struct DeleteInviteInput {
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
    ) -> FieldResult<CreateInvite> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;
        let server_keys: &Arc<ServerKeys> = ctx.data()?;

        auth.authorize_admins_only()?;

        let (invite_url, invite) = Invite::new(
            db,
            server_keys,
            input.model.0,
        ).await?;

        Ok(CreateInvite {
            id: invite.id.clone().into(),
            invite_url,
            invite,
        })
    }

    async fn update_invite<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: UpdateInviteInput,
    ) -> FieldResult<Invite> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let mut invite = Invite::get_with_version(
            db,
            &input.invite_id,
            input.model_version,
            false,
        ).await?;

        invite.config = input.model.0;

        invite.update(db).await?;

        Ok(invite)
    }

    async fn delete_invite<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: DeleteInviteInput,
    ) -> FieldResult<Option<teg_common::Void>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let mut invite = Invite::get(
            db,
            &input.invite_id.0,
            true
        ).await?;

        invite.remove(
            db,
            false,
        )
            .await
            .with_context(|| "Error deleting invite")?;

        Ok(None)
    }
}
