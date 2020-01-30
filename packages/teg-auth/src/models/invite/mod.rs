use chrono::prelude::*;
use futures::prelude::*;
use juniper::{
    FieldResult,
};
use std::sync::Arc;

use crate::{ Context };

#[derive(juniper::GraphQLObject)]
pub struct Invite {
    pub id: i32,
    pub public_key: String,
    pub created_at: NaiveDateTime,

    #[graphql(skip)]
    pub private_key: String,
    #[graphql(skip)]
    pub is_admin: bool,
    #[graphql(skip)]
    pub slug: String,
}

mod consume_invite;
mod invite_code;

pub use consume_invite::*;
pub use invite_code::*;

impl Invite {
    pub async fn admin_create_invite(
        context: &Context,
    ) -> FieldResult<Invite> {
        context.authorize_admins_only()?;

        let db = context.db().await;

        Self::new(&mut db?, false).await
    }

    pub async fn display_initial_invite(
        pool: Arc<sqlx::PgPool>,
    ) -> FieldResult<()> {
        let mut db = pool.acquire().await?;

        let user_count = sqlx::query!(
            "SELECT COUNT(id) as count FROM users WHERE is_admin = True",
        )
            .fetch_one(&mut db)
            .await?
            .count;

        if  user_count == 0 {
            let initial_invite = sqlx::query_as!(
                Self,
                "SELECT * FROM invites WHERE is_admin = True",
            )
                .fetch_optional(&mut db)
                .await?;

            let initial_invite = match initial_invite {
                Some(invite) => invite,
                None => Self::new(&mut db, true).await?,
            };

            println!("{}", initial_invite.welcome_text()?);
        };

        Ok(())
    }

    pub async fn new(
        db: &mut sqlx::pool::PoolConnection<sqlx::PgConnection>,
        is_admin: bool,
    ) -> FieldResult<Invite> {
        use rand::rngs::OsRng;
        use secp256k1::Secp256k1;

        let secp = Secp256k1::new();
        let mut rng = OsRng::new().expect("OsRng");
        let (private_key, public_key) = secp.generate_keypair(&mut rng);

        let hex_private_key = format!("{:x}", private_key);

        let slug = Self::generate_slug(hex_private_key.clone())?;

        let invite = sqlx::query_as!(
            Invite,
            "
                INSERT INTO invites (public_key, private_key, slug, is_admin, created_at)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            ",
            format!("{:x}", public_key),
            hex_private_key,
            slug,
            is_admin,
            Utc::now().naive_utc()
        )
            .fetch_one(db)
            .await?;

        Ok(invite)
    }
}