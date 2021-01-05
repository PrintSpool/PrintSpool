use chrono::prelude::*;
use anyhow::{
    // anyhow,
    Context as _, Result,
};
use arc_swap::ArcSwap;

use super::{
    User,
    UnsavedUser,
    UserConfig,
    jwt::validate_jwt,
};
use crate::invite::Invite;

impl User {
    pub async fn authenticate(
        db: &crate::Db,
        auth_pem_keys: &ArcSwap<Vec<Vec<u8>>>,
        auth_token: String,
        identity_public_key: String
    ) -> Result<Option<User>> {
        let jwt_payload = validate_jwt(auth_pem_keys, auth_token).await?;

        info!("Acess Requested for JWT: {:?}", jwt_payload);
        let mut db = db.begin().await?;

        /*
        * Verify that either:
        * 1. the public key belongs to an invite
        * OR
        * 2. the user's token is authorized
        */

        let invite = Invite::get_by_pk(&mut db, &identity_public_key)
            .await
            .ok();

        // TODO: This could be optimized with a SQL index
        let user = User::get_all(&mut db).await?
            .into_iter()
            .find(|user| {
                user.firebase_uid == jwt_payload.sub
            });

        // To authenticate the user either must be authorized or include a valid invite
        let mut user = if let Some(user @ User { is_authorized: true, .. }) = user {
            user
        } else if let Some(invite) = invite  {
            let user = UnsavedUser {
                firebase_uid: jwt_payload.sub,
                email: None,
                email_verified: false,
                last_logged_in_at: None,
                config: UserConfig {
                    is_admin: invite.config.is_admin,
                },
                is_authorized: false,
            };

            let (next_user, next_db) = user.insert_no_rollback(db).await?;
            db = next_db;
            next_user
        } else {
            return Ok(None)
        };

        /*
        * Update the user
        */
        user.email = Some(jwt_payload.email);
        user.email_verified = jwt_payload.email_verified;
        user.last_logged_in_at = Some(Utc::now());

        user.update(&mut db).await
            .with_context(|| "Unable to update user after authentication")?;

        db.commit().await?;

        info!("User Authorized: {:?}", user.id);
        Ok(Some(user))
    }
}
