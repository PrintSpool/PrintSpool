use std::sync::Arc;
use sha2::{Sha512, Digest};
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_json_store::Record;

use crate::ServerKeys;
use super::InviteConfig;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Invite {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,

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
        let (slug, invite) = Self::new(db, server_keys, is_admin).await?;
        invite.print_welcome_text(slug)?;

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
        is_admin: bool,
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
            config: InviteConfig {
                is_admin,
            },
            secret_hash,
            consumed_by_user_id: None,
        };

        invite.insert(db).await?;

        Ok((slug, invite))
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
//         E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
//     {
//         let row = sqlx::query!(
//             "SELECT props FROM invites WHERE secret_hash = ?",
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
        let consumed = self.consumed_by_user_id.is_some();

        sqlx::query!(
            r#"
                INSERT INTO invites
                (id, version, props, secret_hash, consumed)
                VALUES (?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
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
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let (json, previous_version) = self.prep_for_update()?;
        let consumed = self.consumed_by_user_id.is_some();

        sqlx::query!(
            r#"
                UPDATE invites
                SET
                    props=?,
                    version=?,
                    consumed=?
                WHERE
                    id=?
                    AND version=?
            "#,
            // SET
            json,
            self.version,
            consumed,
            // WHERE
            self.id,
            previous_version,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
