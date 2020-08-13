use std::sync::Arc;
use chrono::prelude::*;
use async_graphql::*;
use anyhow::{Context as _, Result};

use super::{
    User,
    super::Invite,
};
use super::jwt::validate_jwt;
// use crate::models::{ Invite };
use crate::{ Context };
use crate::models::VersionedModel;

impl User {
    pub async fn authenticate(
        context: &Arc<Context>,
        auth_token: String,
        identity_public_key: String
    ) -> Result<Option<User>> {
        let jwt_payload = validate_jwt(context, auth_token).await?;

        info!("Acess Requested for JWT: {:?}", jwt_payload);

        /*
        * Verify that either:
        * 1. the public key belongs to an invite
        * OR
        * 2. the user's token is authorized
        */

        let invite = Invite::find_by_pk(&identity_public_key, &context.db)
            .await
            .with_context(|| "Unable to load invite for authentication")?;

        let user = User::find_opt(&context.db, |user| {
                user.firebase_uid == jwt_payload.sub
            })
            .with_context(|| "Unable to load user for authentication")?;

        // To authenticate the user either must be authorized or include a valid invite
        if
            user.as_ref().map(|user| user.is_authorized).unwrap_or(false) == false
            && invite.is_none()
        {
            return Ok(None)
        }

        let mut user = if let Some(user) = user {
            user
        } else {
            User {
                id: User::generate_id(&context.db)?,
                firebase_uid: jwt_payload.sub,
                email: None,
                email_verified: false,
                created_at: Utc::now(),
                last_logged_in_at: None,
                is_admin: false,
                is_authorized: false,
            }
        };

        /*
        * Upsert and return the user
        */
        user.email = Some(jwt_payload.email);
        user.email_verified = jwt_payload.email_verified;
        user.last_logged_in_at = Some(Utc::now());

        let user = user.insert(&context.db)
            .with_context(|| "Unable to update user after authentication")?;

        info!("User Authorized: {:?}", user.id);

        Ok(Some(user))
    }
}
