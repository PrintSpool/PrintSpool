use chrono::prelude::*;
use juniper::{
    FieldResult,
};

use crate::ResultExt;
use super::{
    User,
    super::Invite,
};
use super::jwt::validate_jwt;
// use crate::models::{ Invite };
use crate::{ Context };

impl User {
    pub async fn authenticate(
        context: &Context,
        auth_token: String,
        identity_public_key: String
    ) -> FieldResult<Option<User>> {
        let jwt_payload = validate_jwt(context, auth_token).await?;

        /*
        * Verify that either:
        * 1. the public key belongs to an invite
        * OR
        * 2. the user's token is authorized
        */

        let invite = Invite::find_by_pk(&identity_public_key, &context.db)
            .await
            .chain_err(|| "Unable to load invite for authentication")?;

        let user = User::scan(&context.db)
            .await
            .find(|user| {
                if let Ok(user) = user {
                    user.firebase_uid == jwt_payload.sub && user.is_authorized
                } else {
                    true
                }
            })
            .transpose()
            .chain_err(|| "Unable to load user for authentication")?;

        if user.is_none() && invite.is_none() {
            return Ok(None)
        }

        eprintln!("JWT Payload: {:?}", jwt_payload);

        let user = if let Some(user) = user {
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

        user.insert(&context.db)
            .await
            .chain_err(|| "Unable to update user after authentication")?;

        eprintln!("User Authorized: {:?}", user);

        Ok(Some(user))
    }
}
