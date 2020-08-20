use std::sync::Arc;
use anyhow::{anyhow, Result};
use async_graphql::*;

use crate::models::VersionedModel;
use crate::{
    Context,
    // ResultExt,
    models::{
        User,
        Invite,
    }
};

// use sled::transaction::ConflictableTransactionError;

pub async fn consume_invite(ctx: &Arc<Context>) -> Result<User> {
    let user_id = ctx.current_user
        .as_ref()
        .ok_or(anyhow!("Cannot consume_invite without user"))?
        .id
        .clone();
    let invite_public_key = ctx.identity_public_key
        .as_ref()
        .ok_or(anyhow!("Cannot consume_invite without public key"))?;

    info!("Consume Invite Req: user: {:?} invite: {:?}", user_id, invite_public_key);

    // Verify that the invite has not yet been consumed
    // TODO: This should be moved inside the transaction once transaction scans are supported
    let invite = Invite::find_opt(&ctx.db, |invite| {
        invite.public_key == *invite_public_key
    })?
        .ok_or(anyhow!("Invite has already been consumed"))?;

    info!("wat11111");
    let user = ctx.db.transaction(|db| {
        info!("lol11111");
        // Fetch the user inside the transaction to prevent overwriting changes from
        // other transactions
        let user = User::get(&db, user_id);
        info!("USER: {:?}", user);

        let mut user = User::get(&db, user_id)?;

        // Authorize the user
        user.is_admin = user.is_admin || invite.is_admin;
        user.is_authorized = true;

        info!("lol22222");
        let user = user.insert(&db)?;
        info!("lol3333");

        // Delete the invite
        db.remove(Invite::key(invite.id))?;

        Ok(user)
    })?;
    info!("wat222222");

    ctx.db.flush_async().await?;
    info!("wat3333333");

    Ok(user)
}
