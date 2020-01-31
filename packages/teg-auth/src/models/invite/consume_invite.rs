use juniper::{
    FieldResult,
};

use crate::{ Context, models::User };

#[derive(GraphQLInputObject)]
pub struct ConsumeInvite {
    #[graphql(name="userID")]
    user_id: i32,
    invite_public_key: String,
}

impl ConsumeInvite {
    pub async fn consume(self: &Self, context: &Context) -> FieldResult<User> {
        let mut tx = context.tx().await?;

        // Verify that the invite has not yet been consumed
        let invite = sqlx::query!(
            "SELECT * FROM invites WHERE public_key=$1",
            self.invite_public_key
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
            self.user_id,
            invite.is_admin
        )
            .fetch_one(&mut tx)
            .await?;

        // Delete the invite
        sqlx::query!(
            "DELETE FROM invites WHERE public_key=$1",
            self.invite_public_key
        )
            .fetch_optional(&mut tx)
            .await?;

        tx.commit().await?;

        Ok(user)
    }
}