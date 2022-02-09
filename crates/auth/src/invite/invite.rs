use std::sync::Arc;
use sha2::{Sha512, Digest};
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use printspool_json_store::Record;

use crate::ServerKeys;
use super::InviteConfig;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invite {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,

    pub config: InviteConfig,

    pub consumed_by_user_id: Option<crate::DbId>,
    pub secret_hash: String,
}

impl Invite {
    pub async fn generate_and_display(
        db: &crate::Db,
        server_keys: &Arc<ServerKeys>,
        is_admin: bool,
    ) -> Result<Self> {
        let config = InviteConfig {
            is_admin,
            name: Some("CLI Generated Invite".to_string()),
        };
        let (invite_url, invite) = Self::new(db, server_keys, config).await?;
        invite.print_welcome_text(invite_url)?;

        Ok(invite)
    }

    // pub async fn generate_or_display_initial_invite(
    //     db: &crate::Db,
    //     server_keys: &Arc<ServerKeys>,
    // ) -> Result<()> {
    //     let have_any_admins = User::get_all(db).await?
    //         .iter()
    //         .any(|user| user.config.is_admin);

    //     if !have_any_admins {
    //         let initial_invite = Self::get_all(db).await?
    //             .into_iter()
    //             .find(|invite| {
    //                 invite.config.is_admin && invite.slug.is_some()
    //             });

    //         let initial_invite = match initial_invite {
    //             Some(invite) => invite,
    //             None => Self::new(db, server_keys, true).await?,
    //         };

    //         initial_invite.print_welcome_text()?;
    //     };

    //     Ok(())
    // }

    pub async fn new(
        db: &crate::Db,
        server_keys: &Arc<ServerKeys>,
        config: InviteConfig,
    ) -> Result<(String, Self)> {
        use rand_core::{RngCore, OsRng};

        // 128 Bit Secrets
        let mut secret = [0u8; 128 / 8];
        OsRng.fill_bytes(&mut secret);

        let slug = Self::generate_slug(server_keys, secret.to_vec())?;

        let secret_hash = Self::hash_secret(&secret);

        let invite = Invite {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            deleted_at: None,
            config,
            secret_hash,
            consumed_by_user_id: None,
        };

        invite.insert(db).await?;

        let web_app_domain = std::env::var("CLOUD_HTTP")?;

        let invite_url = format!(
            "{}/i/{}",
            web_app_domain,
            slug,
        );

        Ok((invite_url, invite))
    }

    pub fn hash_secret(secret: &[u8]) -> String {
        format!("{:x}", Sha512::digest(secret))
    }
}

// impl Invite {
//     // TODO: rename this function
//     pub async fn get_by_pk<'e, 'c, E>(
//         db: E,
//         secret_hash: &str,
//     ) -> Result<Self>
//     where
//         E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
//     {
//         let row = sqlx::query!(
//             "SELECT props FROM invites WHERE secret_hash = $1",
//             secret_hash,
//         )
//             .fetch_one(db)
//             .await?;

//         let entry: Self = serde_json::from_str(&row.props)?;
//         Ok(entry)
//     }
// }

#[async_trait::async_trait]
impl Record for Invite {
    const TABLE: &'static str = "invites";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> printspool_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut printspool_json_store::Version {
        &mut self.version
    }

    fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    fn deleted_at(&self) -> Option<DateTime<Utc>> {
        self.deleted_at
    }

    fn deleted_at_mut(&mut self) -> &mut Option<DateTime<Utc>> {
        &mut self.deleted_at
    }

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Postgres>,
    ) -> Result<()>
    {
        let json = serde_json::to_value(&self)?;
        let consumed = self.consumed_by_user_id.is_some();

        sqlx::query!(
            r#"
                INSERT INTO invites
                (id, version, created_at, props, secret_hash, consumed)
                VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            self.id,
            self.version,
            self.created_at,
            json,
            self.secret_hash,
            consumed,
        )
            .fetch_optional(db)
            .await?;
        Ok(())
    }

    async fn update<'e, 'c, E>(
        &mut self,
        db: E,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let (json, previous_version) = self.prep_for_update()?;
        let consumed = self.consumed_by_user_id.is_some();

        sqlx::query!(
            r#"
                UPDATE invites
                SET
                    props=$1,
                    version=$2,
                    consumed=$3,
                    deleted_at=$4
                WHERE
                    id=$5
                    AND version=$6
            "#,
            // SET
            json,
            self.version,
            consumed,
            self.deleted_at,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
