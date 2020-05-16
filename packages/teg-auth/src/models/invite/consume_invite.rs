use juniper::{
    FieldResult,
};

use crate::{ Context, models::User };

pub async fn consume_invite(context: &Context) -> FieldResult<User> {
    let user_id = context.current_user
        .as_ref()
        .ok_or("Cannot consume_invite without user")?
        .id;
    let invite_public_key = context.identity_public_key
        .as_ref()
        .ok_or("Cannot consume_invite without public key")?;

    let mut tx = context.tx().await?;

    // Verify that the invite has not yet been consumed
    let invite = sqlx::query!(
        "SELECT is_admin FROM invites WHERE public_key=$1",
        &invite_public_key
    )
        .fetch_one(&mut tx)
        .await?;

    // Check if the user is already authorized
    let user = sqlx::query_as!(
        User,
        "
            SELECT * FROM users
            WHERE id=$1
        ",
        user_id
    )
        .fetch_one(&mut tx)
        .await?;

    // Authorize the user
    let user = sqlx::query_as!(
        User,
        "
            UPDATE users
            SET
                is_authorized=True,
                is_admin=$2
            WHERE id=$1
            RETURNING *
        ",
        user_id,
        user.is_admin || invite.is_admin
    )
        .fetch_one(&mut tx)
        .await?;

    // Delete the invite
    sqlx::query!(
        "DELETE FROM invites WHERE public_key=$1",
        &invite_public_key
    )
        .execute(&mut tx)
        .await?;

    tx.commit().await?;

    Ok(user)
}
