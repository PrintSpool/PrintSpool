use std::sync::Arc;
use chrono::prelude::*;
// use futures::prelude::*;
use async_graphql::*;
// use std::sync::Arc;
use anyhow::{Context as _, Result};

use crate::models::VersionedModel;
use super::{
    User,
};

mod graphql;
mod revisions;

pub use revisions::{ Invite, InviteDBEntry };

// ---------------------------------------------

#[InputObject]
pub struct CreateInviteInput {
    pub public_key: String,
    pub is_admin: Option<bool>,
}

#[InputObject]
pub struct UpdateInvite {
    #[field(name="inviteID")]
    pub invite_id: ID,
    pub is_admin: Option<bool>,
}

#[InputObject]
pub struct DeleteInvite {
    #[field(name="inviteID")]
    pub invite_id: ID,
}

mod consume_invite;
mod invite_code;

pub use consume_invite::*;
pub use invite_code::*;

impl Invite {
    pub async fn find_by_pk(public_key: &String, db: &sled::Db) -> Result<Option<Self>> {
        Self::find_opt(&db, |invite| invite.public_key == *public_key)
    }

    // pub async fn admin_count(db: &sled::Db) -> Result<i32> {
    //     Self::scan(db).await
    //         .try_fold(0, |acc, user| {
    //             user.map(|user| acc + (user.is_admin as i32) )
    //         })
    // }

    pub async fn all(context: &Arc<crate::Context>) -> FieldResult<Vec<Self>> {
        context.authorize_admins_only()?;

        // TODO: order the invites by their ids
        let invites = Self::scan(&context.db)
            .collect::<Result<Vec<Self>>>()?;

        Ok(invites)
    }

    pub async fn admin_create_invite(
        context: &Arc<crate::Context>,
        input: CreateInviteInput,
    ) -> FieldResult<Self> {
        context.authorize_admins_only()?;

        let invite = Self {
            id: Self::generate_id(&context.db)?,
            public_key: input.public_key,
            private_key: None,
            slug: None,
            is_admin: input.is_admin.unwrap_or(false),
            created_at: Utc::now(),
        };

        let invite = invite.insert(&context.db)?;

        Ok(invite)
    }

    pub async fn generate_and_display(
        db: &sled::Db,
        is_admin: bool,
    ) -> FieldResult<Self> {
        let invite = Self::new(db, is_admin)?;
        invite.print_welcome_text()?;

        Ok(invite)
    }

    pub async fn generate_or_display_initial_invite(
        db: &sled::Db,
    ) -> FieldResult<()> {
        let admin_user_count = User::admin_count(db).await?;

        if admin_user_count == 0 {
            let initial_invite = Self::find_opt(db, |invite| {
                invite.is_admin && invite.slug.is_some()
            })?;

            let initial_invite = match initial_invite {
                Some(invite) => invite,
                None => Self::new(db, true)?,
            };

            initial_invite.print_welcome_text()?;
        };

        Ok(())
    }

    pub fn new(
        db: &sled::Db,
        is_admin: bool,
    ) -> FieldResult<Self> {
        use secp256k1::{
            rand::rngs::OsRng,
            Secp256k1,
        };

        let secp = Secp256k1::new();
        let mut rng = OsRng::new().expect("OsRng");
        let (binary_private_key, binary_public_key) = secp.generate_keypair(&mut rng);

        use hex::ToHex;

        let private_key = format!("{:x}", binary_private_key);
        let public_key = binary_public_key
            .serialize_uncompressed()
            .to_vec()
            .encode_hex::<String>();

        let slug = Self::generate_slug(private_key.clone())?;

        let invite = Self {
            id: Self::generate_id(db)?,
            private_key: Some(private_key),
            public_key,
            slug: Some(slug),
            is_admin,
            created_at: Utc::now(),
        };

        let invite = invite.insert(db)?;

        Ok(invite)
    }

    pub async fn update(ctx: &Arc<crate::Context>, input: UpdateInvite) -> FieldResult<Self> {
        ctx.authorize_admins_only()?;

        let mut invite = Self::get(&ctx.db, &input.invite_id)?;

        invite.is_admin = input.is_admin.unwrap_or(invite.is_admin);

        let invite = invite.insert(&ctx.db)?;

        Ok(invite)
    }

    pub async fn delete(context: &Arc<crate::Context>, invite_id: ID) -> FieldResult<Option<bool>> {
        context.authorize_admins_only()?;

        context.db.remove(Self::key(&invite_id)?)
            .with_context(|| "Error deleting invite")?;

        Self::flush(&context.db).await?;

        Ok(None)
    }
}
