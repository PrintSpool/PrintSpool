// use std::sync::Arc;
use chrono::prelude::*;
use eyre::{
    eyre,
    Context as _,
    Result,
};
// use arc_swap::ArcSwap;
use teg_json_store::{ Record as _, JsonRow };
use teg_protobufs::{InviteCode, Message};

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
    ) -> Result<Option<User>> {
        let Signal {
            user_id: signalling_user_id,
            email,
            email_verified,
            invite: invite_code,
            ..
        } = signal;
        let signalling_user_id = signalling_user_id.to_string();
        let now = Utc::now();

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

        let is_new_user = user.is_none();
        let mut user = user.unwrap_or_else(|| {
            User {
                id: nanoid!(11),
                version: 0,
                created_at: now,
                deleted_at: None,
                signalling_user_id: Some(signalling_user_id),
                email: None,
                email_verified: false,
                last_logged_in_at: None,
                config: Default::default(),
                is_authorized: false,
                is_local_http_user: false,
            }
        });

        let invite = if let Some(invite_code) = invite_code.as_ref() {
            let invite_code = bs58::decode(invite_code).into_vec()?;
            let invite_code: InviteCode = Message::decode(&invite_code[..])?;

            let secret_hash = Invite::hash_secret(&invite_code.secret[..]);

            let invite = sqlx::query_as!(
                JsonRow,
                "SELECT props FROM invites WHERE secret_hash = ?",
                secret_hash,
            )
                .fetch_one(db)
                .await
                .map_err(|err| {
                    warn!("Invite lookup err ignored: {:?}", err);
                    eyre!("Invite not found")
                })?;

            let mut invite = Invite::from_row(invite)?;

            match (
                invite.deleted_at.as_ref(),
                invite.consumed_by_user_id.as_ref(),
            ) {
                (None, None) => {
                    invite.consumed_by_user_id = Some(user.id.clone());
                    invite.deleted_at = Some(now);
                    invite.update(&mut tx).await?;
                }
                (_, Some(id)) if id == &user.id => {
                    // Idempotent invites: If the invite was already consumed by this user
                    // treat the invite as a no-op
                    ()
                }
                _ => {
                    // The invite has been consumed by another user but we do not want to leak
                    // that information to a potentially malicious client
                    warn!("Invite already consumed by another user");
                    return Err(eyre!("Invite not found"));
                }
            };

            Some(invite)
        } else {
            None
        };

        // To authenticate the user either must be authorized or include a valid invite
        if is_new_user && invite.is_none() {
            Err(eyre!(r#"
                You are not authorized for this 3D printer. Please request an invite from your 3D
                printer admininistrator.
            "#))?;
        }

        /*
        * Update the user
        */
        if let Some(invite) = invite {
            user.is_authorized = true;
            user.config.is_admin = user.config.is_admin || invite.config.is_admin;
        }

        user.email = email;
        user.email_verified = email_verified;
        user.last_logged_in_at = Some(now);

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
