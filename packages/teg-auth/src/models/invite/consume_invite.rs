use juniper::{
    FieldResult,
};

use crate::{
    Context,
    ResultExt,
    models::{
        User,
        Invite,
    }
};

use sled::transaction::ConflictableTransactionError;

pub async fn consume_invite(context: &Context) -> FieldResult<User> {
    let user_id = context.current_user
        .as_ref()
        .ok_or("Cannot consume_invite without user")?
        .id;
    let invite_public_key = context.identity_public_key
        .as_ref()
        .ok_or("Cannot consume_invite without public key".into())?;

    let user = context.db.transaction(|db| {
        use ConflictableTransactionError::Abort;

        // Verify that the invite has not yet been consumed
        let invite = futures::executor::block_on(
            Invite::find_by_pk(invite_public_key, &context.db)
        )
            .map_err(|err| Abort(err))?
            .ok_or(Abort("Invite has already been consumed".into()))?;

        // .map_err(|err| {
            //     Abort(err)
            // })?
            // .ok_or(
            //     Abort("Invite has already been consumed")
            // )?;

        // Re-fetch the user inside the transaction to prevent overwriting changes from
        // other transactions
        let user = futures::executor::block_on(
            User::get(&user_id, &context.db)
        )
            .map_err(|err| Abort(err))?;

        // Authorize the user
        user.is_admin = user.is_admin || invite.is_admin;
        user.is_authorized = true;

        user.insert(&context.db);

        // Delete the invite
        context.db.remove(Invite::key(&invite.id))?;

        Ok(user)
    })
        .chain_err(|| "Unable to consume invite")?;

    Ok(user)
}
