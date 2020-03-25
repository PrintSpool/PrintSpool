use chrono::prelude::*;
// use futures::prelude::*;
use juniper::{
    FieldResult,
    ID,
};
use std::sync::Arc;

use crate::{ Context };

#[derive(juniper::GraphQLObject, Debug)]
pub struct Invite {
    pub id: i32,
    pub public_key: String,
    pub created_at: DateTime<Utc>,
    pub is_admin: bool,

    #[graphql(skip)]
    pub slug: Option<String>,
    #[graphql(skip)]
    pub private_key: Option<String>,
}

#[derive(juniper::GraphQLInputObject)]
pub struct CreateInviteInput {
    pub public_key: String,
    pub is_admin: Option<bool>,
}

#[derive(juniper::GraphQLInputObject)]
pub struct UpdateInvite {
    #[graphql(name="inviteID")]
    pub invite_id: ID,
    pub is_admin: Option<bool>,
}

#[derive(juniper::GraphQLInputObject)]
pub struct DeleteInvite {
    #[graphql(name="inviteID")]
    pub invite_id: ID,
}

mod consume_invite;
mod invite_code;

pub use consume_invite::*;
pub use invite_code::*;

impl Invite {
    pub async fn all(context: &Context) -> FieldResult<Vec<Invite>> {
        context.authorize_admins_only()?;

        let invites = sqlx::query_as!(
            Invite,
            "SELECT * FROM invites ORDER BY id",
        )
            .fetch_all(&mut context.db().await?)
            .await?;

        Ok(invites)
    }

    pub async fn admin_create_invite(
        context: &Context,
        input: CreateInviteInput,
    ) -> FieldResult<Invite> {
        context.authorize_admins_only()?;

        let mut db = context.db().await?;

        let invite = sqlx::query_as!(
            Invite,
            "
                INSERT INTO invites (public_key, is_admin, created_at)
                VALUES ($1, $2, $3)
                RETURNING *
            ",
            input.public_key,
            input.is_admin.unwrap_or(false),
            Utc::now()
        )
            .fetch_one(&mut db)
            .await?;

        Ok(invite)
    }

    pub async fn generate_or_display_initial_invite(
        pool: Arc<sqlx::PgPool>,
    ) -> FieldResult<()> {
        let mut db = pool.acquire().await?;

        let user_count = sqlx::query!(
            "
                SELECT COUNT(id) as count FROM users
                WHERE is_admin = True
            ",
        )
            .fetch_one(&mut db)
            .await?
            .count;

        if  user_count == 0 {
            let initial_invite = sqlx::query_as!(
                Self,
                "
                    SELECT * FROM invites
                    WHERE is_admin = True AND slug IS NOT NULL
                ",
            )
                .fetch_optional(&mut db)
                .await?;

            let initial_invite = match initial_invite {
                Some(invite) => invite,
                None => Self::new(&mut db, true).await?,
            };

            initial_invite.print_welcome_text()?;
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

        use hex::ToHex;

        let hex_private_key = format!("{:x}", private_key);
        let hex_public_key = public_key
            .serialize_uncompressed()
            .to_vec()
            .encode_hex::<String>();

        let slug = Self::generate_slug(hex_private_key.clone())?;

        let invite = sqlx::query_as!(
            Invite,
            "
                INSERT INTO invites (public_key, private_key, slug, is_admin, created_at)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            ",
            hex_public_key,
            hex_private_key,
            slug,
            is_admin,
            Utc::now()
        )
            .fetch_one(db)
            .await?;

        Ok(invite)
    }

    pub async fn update(context: &Context, invite: UpdateInvite) -> FieldResult<Invite> {
        context.authorize_admins_only()?;

        let db_invite = sqlx::query_as!(
            Invite,
            "
                SELECT * FROM invites
                WHERE id=$1
            ",
            invite.invite_id.parse::<i32>()?
        )
            .fetch_one(&mut context.db().await?)
            .await?;

        let next_invite = sqlx::query_as!(
            Invite,
            "
                UPDATE invites
                SET is_admin=$2
                WHERE id=$1
                RETURNING *
            ",
            invite.invite_id.parse::<i32>()?,
            invite.is_admin.unwrap_or(db_invite.is_admin)
        )
            .fetch_one(&mut context.db().await?)
            .await?;

        Ok(next_invite)
    }

    pub async fn delete(context: &Context, invite_id: String) -> FieldResult<Option<bool>> {
        println!("{:?}", invite_id);
        let invite_id = invite_id.parse::<i32>()?;

        context.authorize_admins_only()?;

        let _ = sqlx::query!(
            "DELETE FROM invites WHERE id=$1",
            invite_id
        )
        .execute(&mut context.db().await?)
        .await?;

        Ok(None)
    }
}
