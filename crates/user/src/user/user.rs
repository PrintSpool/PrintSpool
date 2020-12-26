use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::UserConfig;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: crate::DbId,
    pub version: crate::DbId,

    pub config: UserConfig,
    pub created_at: DateTime<Utc>,
    pub last_logged_in_at: Option<DateTime<Utc>>,

    pub firebase_uid: String,
    pub is_authorized: bool,
    /// # Email
    pub email: Option<String>,
    /// # Email Verified
    pub email_verified: bool,
}

// TODO: Create a macro to generate this JSON Store code
// -------------------------------------------------------------
struct JsonRow {
    pub props: String,
}

impl User {
    pub async fn get(
        db: &crate::Db,
        id: crate::DbId,
    ) -> Result<Self> {
        let row = sqlx::query_as!(
            JsonRow,
            "SELECT props FROM users WHERE id = ?",
            id
        )
            .fetch_one(db)
            .await?;

        let entry: Self = serde_json::from_str(&row.props)?;
        Ok(entry)
    }

    pub async fn get_all(
        db: &crate::Db,
    ) -> Result<Vec<Self>> {
        let rows = sqlx::query_as!(
            JsonRow,
            "SELECT props FROM users",
        )
            .fetch_all(db)
            .await?;

        let rows = rows.into_iter()
            .map(|row| serde_json::from_str(&row.props))
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<()> {
        let json = serde_json::to_string(self)?;

        sqlx::query!(
            r#"
                INSERT INTO users
                (id, props)
                VALUES (?, ?)
            "#,
            self.id,
            json,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }

    pub async fn update<'e, 'c, E>(
        &mut self,
        db: E,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let previous_version = self.version;
        self.version = self.version + 1;

        let json = serde_json::to_string(self)?;

        sqlx::query!(
            r#"
                UPDATE users
                SET props=?, version=?
                WHERE id=? AND version=?
            "#,
            json,
            self.version,
            self.id,
            previous_version,
        )
            .fetch_one(db)
            .await?;

        Ok(())
    }
}
