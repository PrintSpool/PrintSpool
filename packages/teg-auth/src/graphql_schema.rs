use async_std::task;
// use futures::prelude::*;
// use chrono::prelude::*;
// use log::{warn};

use juniper::{
    FieldResult,
    // FieldError,
    ID,
};

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

use crate::Context;

pub struct Query;

#[juniper::object(
    Context = Context,
)]
impl Query {
    fn users(context: &Context) -> FieldResult<Vec<User>> {
        task::block_on(
            User::all(context)
        )
    }

    fn invites(context: &Context) -> FieldResult<Vec<Invite>> {
        task::block_on(
            Invite::all(context)
        )
    }

    fn video_sources(context: &Context) -> FieldResult<Vec<VideoSource>> {
        task::block_on(
            get_video_sources(context)
        )
        .map_err(|err| {
            error!("ERR {:?}", err);
            err
        })
    }

    fn ice_candidates(context: &Context, id: ID) -> FieldResult<Vec<IceCandidate>> {
        task::block_on(
            get_ice_candidates(context, id)
        )
        .map_err(|err| {
            error!("ERR {:?}", err);
            err
        })
    }
}

pub struct Mutation;

#[juniper::object(
    Context = Context,
)]
impl Mutation {
    fn authenticate_user(
        context: &Context,
        auth_token: String,
        identity_public_key: String
    ) -> FieldResult<Option<User>> {
        task::block_on(
            User::authenticate(context, auth_token, identity_public_key)
        )
    }

    // Invites
    fn create_invite(
        context: &Context,
        input: CreateInviteInput,
    ) -> FieldResult<Invite> {
        task::block_on(Invite::admin_create_invite(context, input))
    }

    fn update_invite(context: &Context, input: UpdateInvite) -> FieldResult<Invite> {
        task::block_on(
            Invite::update(context, input)
        )
    }

    fn delete_invite(context: &Context, input: DeleteInvite) -> FieldResult<Option<bool>> {
        task::block_on(
            Invite::delete(context, input.invite_id)
        )
    }

    fn consume_invite(context: &Context) -> FieldResult<User> {
        task::block_on(consume_invite(context))
    }

    // Users
    fn update_user(context: &Context, input: UpdateUser) -> FieldResult<User> {
        task::block_on(
            User::update(context, input)
        )
    }

    fn delete_user(context: &Context, input: DeleteUser) -> FieldResult<Option<bool>> {
        task::block_on(
            User::delete(context, input.user_id)
        )
    }

    // Video
    #[graphql(name = "createVideoSDP")]
    fn create_video_sdp(context: &Context, offer: RTCSignalInput) -> FieldResult<VideoSession> {
        task::block_on(
            create_video_sdp(context, offer)
        )
        .map_err(|err| {
            error!("ERR {:?}", err);
            err
        })
    }
}

pub type Schema = juniper::RootNode<'static, Query, Mutation>;
