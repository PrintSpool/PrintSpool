use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};

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

// TODO: Create a macro to generate this JSON Store code
// -------------------------------------------------------------
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

struct JsonRow {
    pub props: String,
}

impl UnsavedUser {
    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<User> {
        let db = db.begin().await?;

        let (user, db) = self.insert_no_rollback(db).await?;

        db.commit().await?;

        Ok(user)
    }

    /// Insert but without a transaction. Intended to be used inside functions that provide their
    /// own transactions.
    pub async fn insert_no_rollback<'c>(
        &self,
        mut db: sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<(User, sqlx::Transaction<'c, sqlx::Sqlite>)> {
        // Generate an ID for the row
        sqlx::query!(
            r#"
                INSERT INTO users
                (props)
                VALUES ("{}")
            "#
        )
            .fetch_one(&mut db)
            .await?;

        let id = sqlx::query!(
            "SELECT last_insert_rowid() as id"
        )
            .fetch_one(&mut db)
            .await?
            .id;

        // Add the sqlite-generated monotonic ID and other default fields in to the json
        let mut json = serde_json::to_value(self)?;
        let map = json
            .as_object_mut()
            .expect("Struct incorrectly serialized for JsonRow insert");

        map.insert("id".to_string(), id.into());
        map.insert("version".to_string(), 0.into());
        map.insert("created_at".to_string(), serde_json::to_value(Utc::now())?);

        // Update Sqlite - adding the modified JSON including the ID
        let json_string = json.to_string();
        sqlx::query!(
            r#"
                UPDATE users
                SET props=?
                WHERE id=?
            "#,
            json_string,
            id,
        )
            .fetch_one(&mut db)
            .await?;

        let entry: User = serde_json::from_value(json)?;

        Ok((entry, db))
    }
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

    pub async fn get_with_version(
        db: &crate::Db,
        id: crate::DbId,
        version: crate::DbId,
    ) -> Result<Self> {
        let row = sqlx::query_as!(
            JsonRow,
            "SELECT props FROM users WHERE id = ? AND version = ?",
            id,
            version,
        )
            .fetch_one(db)
            .await?;

        let entry: Self = serde_json::from_str(&row.props)?;
        Ok(entry)
    }

    // pub async fn get_by_pk<'e, 'c, E>(
    //     db: E,
    //     public_key: &str,
    // ) -> Result<Self>
    // where
    //     E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    // {
    //     let row = sqlx::query_as!(
    //         JsonRow,
    //         "SELECT props FROM users WHERE public_key = ?",
    //         public_key,
    //     )
    //         .fetch_one(db)
    //         .await?;

    //     let entry: Self = serde_json::from_str(&row.props)?;
    //     Ok(entry)
    // }

    pub async fn get_all<'e, 'c, E>(
        db: E,
    ) -> Result<Vec<Self>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
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

    pub async fn remove<'e, 'c, E>(
        db: E,
        id: crate::DbId,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        sqlx::query!(
            r#"
                DELETE FROM users WHERE id=?
            "#,
            id,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
