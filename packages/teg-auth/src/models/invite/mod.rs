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
        use rand::rngs::OsRng;
        use secp256k1::Secp256k1;

        let secp = Secp256k1::new();
        let mut rng = OsRng::new().expect("OsRng");
        let (private_key, public_key) = secp.generate_keypair(&mut rng);

        let invite = sqlx::query!(
            "
                INSERT INTO invites (public_key, private_key, created_at)
                VALUES ($1, $2, $3)
                RETURNING *
            ",
            format!("{:x}", public_key),
            format!("{:x}", private_key),
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