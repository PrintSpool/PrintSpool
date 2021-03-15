use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_json_store::{ Record, JsonRow };

use super::UserConfig;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,

    pub config: UserConfig,
    pub last_logged_in_at: Option<DateTime<Utc>>,

    pub signalling_user_id: Option<String>,
    pub is_authorized: bool,
    pub is_local_http_user: bool,
    /// # Email
    pub email: Option<String>,
    /// # Email Verified
    pub email_verified: bool,
}

impl User {
    pub async fn get_local_http_user(
        db: &crate::Db,
    ) -> Result<Self> {
        let user = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM users where is_local_http_user
            "#,
        )
            .fetch_optional(db)
            .await?;

        let user = if let Some(user) = user {
            Self::from_row(user)?
        } else {
            // Create the local http user if it doesn't exist
            let user = User {
                id: nanoid!(11),
                version: 0,
                created_at: Utc::now(),
                deleted_at: None,
                signalling_user_id: None,
                email: None,
                email_verified: false,
                last_logged_in_at: None,
                config: Default::default(),
                is_authorized: true,
                is_local_http_user: true,
            };

            user.insert(db).await?;
            user
        };

        Ok(user)
    }

    pub async fn verify_other_admins_exist<'e, 'c, E>(
        db: E,
        id: &crate::DbId,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        sqlx::query!(
            r#"
                SELECT id FROM users
                WHERE id != ? AND json_extract(props, '$.config.is_admin')
            "#,
            id,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }
}

#[async_trait::async_trait]
impl Record for User {
    const TABLE: &'static str = "users";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> teg_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut teg_json_store::Version {
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
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()> {
        let json = serde_json::to_string(&self)?;
        sqlx::query!(
            r#"
                INSERT INTO users
                (id, version, created_at, props, signalling_user_id, is_local_http_user)
                VALUES (?, ?, ?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            self.created_at,
            json,
            self.signalling_user_id,
            self.is_local_http_user,
        )
            .fetch_optional(db)
            .await?;
        Ok(())
    }
}
