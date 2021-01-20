use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};
use teg_json_store::{Record, UnsavedRecord};

use super::UserConfig;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: crate::DbId,
    pub version: crate::DbId,
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
    pub async fn update_from_mutation(
        db: &crate::Db,
        id: crate::DbId,
        version: crate::DbId,
        model: serde_json::Value,
    ) -> Result<Self> {
        let mut user = Self::get_with_version(db, id, version).await?;

        user.config = serde_json::from_value(model)?;

        user.update(db).await?;

        Ok(user)
    }

    pub async fn remove_from_mutation(
        db: &crate::Db,
        id: crate::DbId,
    ) -> Result<()> {
        let mut tx = db.begin().await?;
        // Verify that there will be at least one admin in the database after this user is
        // removed.
        sqlx::query!(
            r#"
                SELECT id FROM users
                WHERE id != ? AND json_extract(props, '$.config.is_admin')
            "#,
            id,
        )
            .fetch_one(&mut tx)
            .await
            .with_context(|| r#"
                Cannot delete only admin user.
                Please add another administrator before deleting this user.
            "#)?;

        Self::remove(&mut tx, id).await?;
        tx.commit().await?;

        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedUser {
    pub config: UserConfig,
    pub last_logged_in_at: Option<DateTime<Utc>>,

    pub firebase_uid: String,
    pub is_authorized: bool,
    /// # Email
    pub email: Option<String>,
    /// # Email Verified
    pub email_verified: bool,
}

impl Record for User {
    const TABLE: &'static str = "users";

    fn id(&self) -> crate::DbId {
        self.id
    }

    fn version(&self) -> crate::DbId {
        self.version
    }

    fn version_mut(&mut self) -> &mut crate::DbId {
        &mut self.version
    }
}
impl UnsavedRecord<User> for UnsavedUser {}
