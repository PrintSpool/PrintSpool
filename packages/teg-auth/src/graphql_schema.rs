use async_std::task;
// use futures::prelude::*;

use juniper::{
    FieldResult,
    FieldError,
};

use diesel::{
    QueryDsl,
    RunQueryDsl,
    // ExpressionMethods,
};

use crate::models::{ User, UpdateUser };
use crate::Context;
use crate::user_profile_query;

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
}

struct ConsumeInvite {
    user_id: i32,
    invite_code: String,
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
    ) -> FieldResult<User> {
        // TODO: switch url depending on environment
        let user_profile_server = "http://localhost:8080/graphql";

        use {
            graphql_client::{ GraphQLQuery, Response },
            reqwest,
        };

        use user_profile_query::{ UserProfileQuery, Variables, ResponseData };

        let async_authenticate_user = async {
            /*
             * Query the user profile server
             */
            let request_body = UserProfileQuery::build_query(Variables);

            let mut res: Response<ResponseData> = reqwest::Client::new()
                .post(user_profile_server)
                .json(&request_body)
                .send()
                .await?
                .json()
                .await?;

            if let Some(errors) = res.errors {
                return Err(FieldError::new(
                    errors.iter().map(|e| e.message.clone()).collect::<Vec<String>>().join(" "),
                    graphql_value!({ "internal_error": "Unable to fetch user profile data" }),
                ))
            }

            let user_profile = res.data
                .map(|data| data.current_user)
                .ok_or(
                    FieldError::new(
                        "Invalid GraphQL Response: No error or data received",
                        graphql_value!({ "internal_error": "Unable to fetch user profile data" }),
                    )
                )?;

            /*
             * Upsert and return the user
             */
            let mut db = context.sqlx_pool.acquire().await?;

            let user = sqlx::query_as!(
                User,
                "
                    INSERT INTO users (name, user_profile_id, email, email_verified)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (user_profile_id) DO UPDATE SET
                        name = $1,
                        email = $3,
                        email_verified = $4
                    RETURNING *
                ",
                // TODO: proper NULL handling
                user_profile.name.unwrap_or("".to_string()),
                user_profile.id,
                // TODO: proper NULL handling
                user_profile.email.unwrap_or("".to_string()),
                user_profile.email_verified
            )
                .fetch_one(&mut db)
                .await?;

            Ok(user)
        };

        task::block_on(async_authenticate_user)
    }

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

    fn update_user(context: &Context, user: UpdateUser) -> FieldResult<User> {
        use super::schema::users::dsl;

        let id = user.id.parse::<i32>()?;

        let result = diesel::update(dsl::users.find(id))
            .set(&user)
            .get_result(&context.db()?)?;

        Ok(result)
    }
}

pub type Schema = juniper::RootNode<'static, Query, Mutation>;
