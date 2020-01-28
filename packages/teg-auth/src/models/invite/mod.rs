use chrono::prelude::*;
use juniper::{
    FieldResult,
};

use crate::{ Context };

#[derive(juniper::GraphQLObject)]
pub struct Invite {
    pub id: i32,
    pub public_key: String,
    pub created_at: NaiveDateTime,
}

mod consume_invite;
pub use consume_invite::*;

impl Invite {
    pub async fn new(
        context: &Context,
    ) -> FieldResult<Invite> {
        let public_key = "".to_string(); // TODO
        let private_key = "".to_string(); // TODO

        let invite = sqlx::query!(
            "
                INSERT INTO invites (public_key, private_key, created_at)
                VALUES ($1, $2, $3)
                RETURNING *
            ",
            public_key,
            private_key,
            Utc::now().naive_utc()
        )
            .fetch_one(&mut context.sqlx_db().await?)
            .await?;

        let invite = Invite {
            id: invite.id,
            public_key: invite.public_key,
            created_at: invite.created_at,
        };

        Ok(invite)
    }
}