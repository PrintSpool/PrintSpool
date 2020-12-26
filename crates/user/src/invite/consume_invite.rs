use anyhow::{anyhow, Result};

use crate::User;
use super::Invite;

pub async fn consume_invite(
    db: &crate::Db,
    identity_public_key: String,
    invite_public_key: String,
    mut user: User,
) -> Result<User> {
    info!("Consume Invite Req: user: {:?} invite: {:?}", user.id, invite_public_key);

    let mut db = db.begin().await?;

    // Verify that the invite has not yet been consumed
    // TODO: This should be moved inside the transaction once transaction scans are supported
    let invite = Invite::get_by_pk(&mut db, invite_public_key)
        .await
        .map_err(|_| anyhow!("Invite has already been consumed"))?;

    // Authorize the user
    user.config.is_admin = user.config.is_admin || invite.config.is_admin;
    user.is_authorized = true;

    user.update(&mut db).await?;

    // Delete the invite
    Invite::remove(&mut db, invite.id).await?;

    db.commit().await?;

    Ok(user)
}
