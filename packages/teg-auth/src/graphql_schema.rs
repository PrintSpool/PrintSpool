use juniper::{
    FieldResult,
    // FieldError,
};

use diesel::{
    QueryDsl,
    RunQueryDsl,
    // ExpressionMethods,
};

use crate::models::{ User };
use crate::Context;

pub struct Query;

#[juniper::object(
    Context = Context,
)]
impl Query {
    fn users(context: &Context) -> FieldResult<Vec<User>> {
        use super::schema::users::dsl;

        let result = dsl::users.load(&context.db()?)?;

        Ok(result)
    }

    // fn current_user(auth_token: String, identity_public_key: String) -> User {
    //     // TODO
    // }
}

struct ConsumeInvite {
    auth_token: String,
    invite_code: String,
}

pub struct Mutation;

#[juniper::object(
    Context = Context,
)]
impl Mutation {
    // fn consume_invite(context: &Context, input: ConsumeInvite) -> FieldResult<User> {
    //     use super::schema::users::dsl;

    //     // TODO: fetch the user
    //     // const id = user_id.parse::<i32>()?;
    //     // const user = User {
    //     //     // TODO
    //     // }

    //     let result = diesel::insert_into(dsl::users)
    //         .values(&user)
    //         .get_result(&context.db()?)?;

    //     Ok(result)
    // }

    fn remove_user(context: &Context, user_id: String) -> FieldResult<Option<bool>> {
        use super::schema::users::dsl;

        diesel::delete(
            dsl::users
                .find(user_id.parse::<i32>()?)
        )
            .execute(&context.db()?)?;

        Ok(None)
    }

    // fn update_user(context: &Context, user: UpdateUser) -> FieldResult<Option<bool>> {
    //     use super::schema::users::dsl;

    //     let id = user_id.parse::<i32>()?;

    //     let result = diesel::update(dsl::users.find(id))
    //         .values(&user)
    //         .get_result(&context.db()?)?;

    //     Ok(result)
    // }
}

pub type Schema = juniper::RootNode<'static, Query, Mutation>;
