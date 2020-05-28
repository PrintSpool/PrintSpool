use chrono::prelude::*;
// use futures::prelude::*;
use juniper::{
    FieldResult,
    ID,
};
// use std::sync::Arc;
use serde::{Deserialize, Serialize};

use crate::{
    Context,
    ResultExt,
};

use super::{
    User,
};

mod graphql;

#[derive(Debug, Serialize, Deserialize)]
pub struct Invite {
    pub id: ID,
    pub public_key: String,
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,

    pub slug: Option<String>,
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


const DB_PREFIX: &str = "invites";

impl Invite {
    pub fn key(invite_id: &ID) -> String {
        format!("{}:{}", DB_PREFIX, invite_id.to_string())
    }

    pub fn generate_id(db: &sled::Db) -> crate::Result<ID> {
        let id = db.generate_id()
            .map(|id| format!("{:64}", id))
            .chain_err(|| "Error generating invite id")?
            .into();
    }

    pub async fn get(invite_id: &ID, db: &sled::Db) -> crate::Result<Self> {
        let iv_vec = db.get(Self::key(invite_id))
            .chain_err(|| "Unable to get invite")?
            .ok_or(format!("invite {:?} not found", invite_id))?;

        let invite = serde_cbor::from_slice(iv_vec.as_ref())
            .chain_err(|| "Unable to deserialize invite in Invite::get")?;

        Ok(invite)
    }

    pub async fn insert(&self, db: &sled::Db) -> crate::Result<()> {
        let bytes = serde_cbor::to_vec(self)
            .chain_err(|| "Unable to deserialize invite in Invite::get")?;

        db.insert(Self::key(&self.id), bytes)
            .chain_err(|| "Unable to insert invite")?;

        Ok(())
    }

    pub async fn scan(db: &sled::Db) -> impl Iterator<Item = crate::Result<Self>> {
        db.scan_prefix(&DB_PREFIX)
            .values()
            .map(|iv_vec: sled::Result<sled::IVec>| {
                iv_vec
                    .chain_err(|| "Error scanning all invites")
                    .and_then(|iv_vec| {
                        serde_cbor::from_slice(iv_vec.as_mut())
                            .chain_err(|| "Unable to deserialize invite in Invite::scan")
                    })
            })
    }

    pub async fn find_by_pk(public_key: &String, db: &sled::Db) -> crate::Result<Option<Self>> {
        Self::scan(&db)
            .await
            .find(|invite| {
                if let Ok(invite) = invite {
                    invite.public_key == *public_key
                } else {
                    true
                }
            })
            .transpose()
    }

    // pub async fn admin_count(db: &sled::Db) -> crate::Result<i32> {
    //     Self::scan(db).await
    //         .try_fold(0, |acc, user| {
    //             user.map(|user| acc + (user.is_admin as i32) )
    //         })
    // }

    pub async fn all(context: &Context) -> FieldResult<Vec<Self>> {
        context.authorize_admins_only()?;

        // TODO: order the invites by their ids
        let invites = Self::scan(&context.db)
            .await
            .collect::<crate::Result<Vec<Self>>>()?;

        Ok(invites)
    }

    pub async fn admin_create_invite(
        context: &Context,
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

        invite.insert(&context.db)
            .await?;

        Ok(invite)
    }

    pub async fn generate_and_display(
        db: &sled::Db,
        is_admin: bool,
    ) -> FieldResult<Self> {
        let invite = Self::new(db, is_admin).await?;
        invite.print_welcome_text()?;

        Ok(invite)
    }

    pub async fn generate_or_display_initial_invite(
        db: &sled::Db,
    ) -> FieldResult<()> {
        let admin_user_count = User::admin_count(db).await?;

        if admin_user_count == 0 {
            let initial_invite = Self::scan(db)
                .await
                .find(|user| {
                    if let Ok(user) = user {
                        user.is_admin && user.slug.is_some()
                    } else {
                        true
                    }
                })
                .transpose()?;

            let initial_invite = match initial_invite {
                Some(invite) => invite,
                None => Self::new(db, true).await?,
            };

            initial_invite.print_welcome_text()?;
        };

        Ok(())
    }

    pub async fn new(
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

        invite.insert(db);

        Ok(invite)
    }

    pub async fn update(context: &Context, input: UpdateInvite) -> FieldResult<Self> {
        context.authorize_admins_only()?;

        let invite = Self::get(&input.invite_id, &context.db)
            .await?;

        invite.is_admin = input.is_admin.unwrap_or(invite.is_admin);

        invite.insert(&context.db);

        Ok(invite)
    }

    pub async fn delete(context: &Context, invite_id: ID) -> FieldResult<Option<bool>> {
        context.authorize_admins_only()?;

        context.db.remove(Self::key(&invite_id))
            .chain_err(|| "Error deleting invite")?;

        Ok(None)
    }
}
