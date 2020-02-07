use async_std::task;
// use futures::prelude::*;
// use chrono::prelude::*;
use log::{warn};

use juniper::{
    FieldResult,
    // FieldError,
};

use crate::models::{
    User,
    UpdateUser,
    DeleteUser,
    Invite,
    UpdateInvite,
    DeleteInvite,
    ConsumeInvite,
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
            .map_err(|err| {
                warn!("{:?}", err);
                err
            })
    }

    // Invites
    fn create_invite(
        context: &Context,
    ) -> FieldResult<Invite> {
        task::block_on(Invite::admin_create_invite(context))
    }

    fn update_invite(context: &Context, input: UpdateInvite) -> FieldResult<Invite> {
        task::block_on(
            Invite::update(context, input)
        )
    }

    fn delete_invite(context: &Context, input: DeleteInvite) -> FieldResult<Option<bool>> {
        task::block_on(
            Invite::delete(context, input.invite_id.to_string())
        )
    }

    fn consume_invite(context: &Context, input: ConsumeInvite) -> FieldResult<User> {
        task::block_on(input.consume(context))
    }

    // Users
    fn update_user(context: &Context, input: UpdateUser) -> FieldResult<User> {
        task::block_on(
            User::update(context, input)
        )
    }

    fn delete_user(context: &Context, input: DeleteUser) -> FieldResult<Option<bool>> {
        task::block_on(
            User::delete(context, input.user_id.to_string())
        )
    }
}

pub type Schema = juniper::RootNode<'static, Query, Mutation>;
