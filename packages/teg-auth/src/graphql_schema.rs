use async_std::task;
// use futures::prelude::*;
// use chrono::prelude::*;
// use log::{warn};

use async_graphql::*;

use crate::models::{
    User,
    UpdateUser,
    DeleteUser,
    Invite,
    CreateInviteInput,
    UpdateInvite,
    DeleteInvite,
    consume_invite,

    get_video_sources,
    create_video_sdp,
    VideoSource,
    RTCSignalInput,
    VideoSession,
    IceCandidate,
    get_ice_candidates,
};

pub struct Query;

#[Object]
impl Query {
    async fn users<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<User>> {
        User::all(ctx.data()?).await
    }

    async fn invites<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Invite>> {
        Invite::all(ctx.data()?).await
    }

    async fn video_sources<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<VideoSource>> {
            get_video_sources(ctx.data()?)
                .await
                .map_err(|err| {
                    error!("ERR {:?}", err);
                    err
                })
                .or(Ok(vec![]))
    }

    async fn ice_candidates<'ctx>(&self, ctx: &'ctx Context<'_>, id: ID) -> FieldResult<Vec<IceCandidate>> {
        get_ice_candidates(ctx.data()?, id)
            .await
            .map_err(|err| {
                error!("ERR {:?}", err);
                err
            })
    }
}

pub struct Mutation;

#[Object]
impl Mutation {
    async fn authenticate_user<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        auth_token: String,
        identity_public_key: String
    ) -> FieldResult<Option<User>> {
        Ok(User::authenticate(ctx.data()?, auth_token, identity_public_key).await?)
    }

    // Invites
    async fn create_invite<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: CreateInviteInput,
    ) -> FieldResult<Invite> {
        Invite::admin_create_invite(ctx.data()?, input).await
    }

    async fn update_invite<'ctx>(&self, ctx: &'ctx Context<'_>, input: UpdateInvite) -> FieldResult<Invite> {
        task::block_on(
            Invite::update(ctx.data()?, input)
        )
    }

    async fn delete_invite<'ctx>(&self, ctx: &'ctx Context<'_>, input: DeleteInvite) -> FieldResult<Option<bool>> {
        task::block_on(
            Invite::delete(ctx.data()?, input.invite_id)
        )
    }

    async fn consume_invite<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<User> {
        Ok(consume_invite(ctx.data()?).await?)
    }

    // Users
    async fn update_user<'ctx>(&self, ctx: &'ctx Context<'_>, input: UpdateUser) -> FieldResult<User> {
        task::block_on(
            User::update(ctx.data()?, input)
        )
    }

    async fn delete_user<'ctx>(&self, ctx: &'ctx Context<'_>, input: DeleteUser) -> FieldResult<Option<bool>> {
        task::block_on(
            User::delete(ctx.data()?, input.user_id)
        )
    }

    // Video
    #[field(name = "createVideoSDP")]
    async fn create_video_sdp<'ctx>(&self, ctx: &'ctx Context<'_>, offer: RTCSignalInput) -> FieldResult<VideoSession> {
        task::block_on(
            create_video_sdp(ctx.data()?, offer)
        )
        .map_err(|err| {
            error!("ERR {:?}", err);
            err
        })
    }
}
