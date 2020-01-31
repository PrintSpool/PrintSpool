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
    Invite,
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

    fn create_invite(
        context: &Context,
    ) -> FieldResult<Invite> {
        task::block_on(Invite::admin_create_invite(context))
    }

    fn consume_invite(context: &Context, input: ConsumeInvite) -> FieldResult<User> {
        task::block_on(input.consume(context))
    }

    fn remove_user(context: &Context, user_id: String) -> FieldResult<Option<bool>> {
        task::block_on(
            User::remove(context, user_id)
        )
    }

    fn update_user(context: &Context, user: UpdateUser) -> FieldResult<User> {
        task::block_on(
            User::update(context, user)
        )
    }
}

pub type Schema = juniper::RootNode<'static, Query, Mutation>;
