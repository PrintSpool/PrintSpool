use chrono::prelude::*;
use juniper::{
    FieldResult,
    FieldError,
};

use {
    graphql_client::{ GraphQLQuery, Response },
};

use super::User;
// use crate::models::{ Invite };
use crate::{ Context };
use crate::user_profile_query;

impl User {
    pub async fn authenticate(
        context: &Context,
        auth_token: String,
        identity_public_key: String
    ) -> FieldResult<Option<User>> {
        // TODO: switch url depending on environment
        let user_profile_server = "http://localhost:8080/graphql";

        use user_profile_query::{ UserProfileQuery, Variables, ResponseData };

        /*
        * Query the user profile server
        */
        let request_body = UserProfileQuery::build_query(Variables);

        let res: Response<ResponseData> = reqwest::blocking::Client::new()
            .post(user_profile_server)
            .json(&request_body)
            .header(
                reqwest::header::AUTHORIZATION,
                format!("BEARER {}", auth_token),
            )
            .send()?
            // .await?
            .json()?;
            // .await?;

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
        * Verify that either:
        * 1. the public key belongs to an invite
        * OR
        * 2. the user's token is authorized
        */
        let mut db = context.db().await?;

        let invite = sqlx::query!(
            "SELECT id FROM invites WHERE public_key=$1",
            identity_public_key
        )
            .fetch_optional(&mut db)
            .await?;

        if invite.is_none() {
            let user = sqlx::query!(
                "SELECT * FROM users WHERE user_profile_id=$1 AND is_authorized=True",
                user_profile.id
            )
                .fetch_optional(&mut db)
                .await?;

            if user.is_none() {
                return Ok(None)
            }
        }

        println!("{:?}", user_profile);

        /*
        * Upsert and return the user
        */
        let user = sqlx::query_as!(
            User,
            "
                INSERT INTO users (
                    name,
                    user_profile_id,
                    email,
                    email_verified,
                    created_at,
                    last_logged_in_at
                )
                VALUES ($1, $2, $3, $4, $5, $5)
                ON CONFLICT (user_profile_id) DO UPDATE SET
                    name = $1,
                    email = $3,
                    email_verified = $4,
                    last_logged_in_at = $5
                RETURNING *
            ",
            // TODO: proper NULL handling
            user_profile.name,
            user_profile.id,
            // TODO: proper NULL handling
            user_profile.email,
            user_profile.email_verified,
            Utc::now()
        )
            .fetch_one(&mut db)
            .await?;

        println!("user?? {:?}", user);

        Ok(Some(user))
    }
}