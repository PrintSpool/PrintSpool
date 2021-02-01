use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_json_store::Record;

use super::UserConfig;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,

    pub config: UserConfig,
    pub last_logged_in_at: Option<DateTime<Utc>>,

    pub signalling_user_id: String,
    pub is_authorized: bool,
    /// # Email
    pub email: Option<String>,
    /// # Email Verified
    pub email_verified: bool,
}

impl User {
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

    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()> {
        let json = serde_json::to_string(&self)?;
        sqlx::query!(
            r#"
                INSERT INTO users
                (id, version, props, signalling_user_id)
                VALUES (?, ?, ?, ?)
            "#,
            self.id,
            self.version,
            json,
            self.signalling_user_id,
        )
            .fetch_one(db)
            .await?;
        Ok(())
    }
}
