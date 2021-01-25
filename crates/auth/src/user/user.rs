use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
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

    pub firebase_uid: String,
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
}
