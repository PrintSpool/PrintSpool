use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;

use crate::user::User;
use super::InviteConfig;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invite {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,

    pub config: InviteConfig,

    pub public_key: String,
    pub private_key: Option<String>,
    pub slug: Option<String>,
}

impl Invite {
    pub async fn update_from_mutation(
        db: &crate::Db,
        id: &crate::DbId,
        version: teg_json_store::Version,
        model: serde_json::Value,
    ) -> Result<Self> {
        let mut invite = Self::get_with_version(db, id, version).await?;

        invite.config = serde_json::from_value(model)?;

        invite.update(db).await?;

        Ok(invite)
    }

    pub async fn generate_and_display(
        db: &crate::Db,
        is_admin: bool,
    ) -> Result<Self> {
        let invite = Self::new(db, is_admin).await?;
        invite.print_welcome_text()?;

        Ok(invite)
    }

    pub async fn generate_or_display_initial_invite(
        db: &crate::Db,
    ) -> Result<()> {
        let have_any_admins = User::get_all(db).await?
            .iter()
            .any(|user| user.config.is_admin);

        if !have_any_admins {
            let initial_invite = Self::get_all(db).await?
                .into_iter()
                .find(|invite| {
                    invite.config.is_admin && invite.slug.is_some()
                });

            let initial_invite = match initial_invite {
                Some(invite) => invite,
                None => Self::new(db, true).await?,
            };

            initial_invite.print_welcome_text()?;
        };

        Ok(())
    }

    pub async fn new(
        db: &crate::Db,
        is_admin: bool,
    ) -> Result<Self> {
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

        let invite = Invite {
            id: nanoid!(),
            version: 0,
            created_at: Utc::now(),
            private_key: Some(private_key),
            public_key,
            slug: Some(slug),
            config: InviteConfig {
                is_admin,
            },
        };

        invite.insert(db).await?;

        Ok(invite)
    }
}

impl Invite {
    pub async fn get_by_pk<'e, 'c, E>(
        db: E,
        public_key: &str,
    ) -> Result<Self>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let row = sqlx::query!(
            "SELECT props FROM invites WHERE public_key = ?",
            public_key,
        )
            .fetch_one(db)
            .await?;

        let entry: Self = serde_json::from_str(&row.props)?;
        Ok(entry)
    }
}

#[async_trait::async_trait]
impl Record for Invite {
    const TABLE: &'static str = "invites";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> teg_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut teg_json_store::Version {
        &mut self.version
    }

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()> {
        let json = serde_json::to_string(&self)?;
        sqlx::query!(
            r#"
                INSERT INTO invites
                (id, version, props, public_key)
                VALUES (?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            self.public_key,
        )
            .fetch_one(db)
            .await?;
        Ok(())
    }
}
