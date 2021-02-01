// use std::sync::Arc;
use chrono::prelude::*;
use eyre::{
    eyre,
    Context as _,
    Result,
};
// use arc_swap::ArcSwap;
use teg_json_store::{ Record as _, JsonRow };

use super::{
    User,
    // UserConfig,
    // jwt::validate_jwt,
};
use crate::invite::Invite;
use crate::Signal;

impl User {
    pub async fn authenticate(
        db: &crate::Db,
        // auth_pem_keys: Arc<ArcSwap<Vec<Vec<u8>>>>,
        signal: Signal,
        identity_public_key: &Option<String>
    ) -> Result<Option<User>> {
        let Signal {
            user_id: signalling_user_id,
            email,
            email_verified,
            ..
        } = signal;
        let signalling_user_id = signalling_user_id.to_string();

        let mut tx = db.begin().await?;

        /*
        * Verify that either:
        * 1. the user is authorized
        * OR
        * 2. the identity public key belongs to an unused invite
        */

        let user = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM users WHERE signalling_user_id = ?
            "#,
            signalling_user_id,
        )
            .fetch_optional(&mut tx)
            .await?
            .map(|row| User::from_row(row))
            .transpose()?;

        let invite = if let Some(pk) = identity_public_key.as_ref() {
            let invite = Invite::get_by_pk(&mut tx, &pk)
                .await
                .map_err(|err| {
                    warn!("Invite lookup err ignored: {:?}", err);
                    eyre!("Invite has already been used")
                })?;
            Invite::remove(&mut tx, &invite.id).await?;
            Some(invite)
        } else {
            None
        };

        // To authenticate the user either must be authorized or include a valid invite
        if user.is_none() && invite.is_none() {
            Err(eyre!("Invite identity public key required"))?;
        }

        let is_new_user = user.is_none();
        let mut user = user.unwrap_or_else(|| {
            User {
                id: nanoid!(11),
                version: 0,
                created_at: Utc::now(),
                signalling_user_id,
                email: None,
                email_verified: false,
                last_logged_in_at: None,
                config: Default::default(),
                is_authorized: false,
            }
        });

        /*
        * Update the user
        */
        if let Some(invite) = invite {
            user.is_authorized = true;
            user.config.is_admin = user.config.is_admin || invite.config.is_admin;
        }

        user.email = email;
        user.email_verified = email_verified;
        user.last_logged_in_at = Some(Utc::now());

        if is_new_user {
            user.insert_no_rollback(&mut tx).await?;
        } else {
            user.update(&mut tx).await
                .wrap_err_with(|| "Unable to update user after authentication")?;
        }

        tx.commit().await?;

        info!("User Authorized: {:?}", user.id);
        Ok(Some(user))
    }
}
