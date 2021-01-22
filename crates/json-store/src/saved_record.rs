// #[macro_use] extern crate tracing;

use serde::{Serialize, de::DeserializeOwned};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

#[derive(sqlx::FromRow)]
struct JsonRow {
    pub props: String,
}

#[async_trait::async_trait]
pub trait Record: Sync + Send + Serialize + DeserializeOwned + 'static {
    const TABLE: &'static str;

    fn id(&self) -> crate::DbId;
    fn version(&self) -> crate::DbId;
    fn version_mut(&mut self) -> &mut i32;

    async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<()> {
        let mut tx = db.begin().await?;

        self.insert_no_rollback(&mut tx).await?;

        tx.commit().await?;

        Ok(())
    }

    /// Insert but without a transaction. Intended to be used inside functions that provide their
    /// own transactions.
    async fn insert_no_rollback<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()> {
        sqlx::query(&format!(
            r#"
                INSERT INTO {}
                (id, version, props)
                VALUES (?, ?, ?)
            "#,
            Self::TABLE,
        ))
            .bind(self.id())
            .bind(self.version())
            .bind(serde_json::to_string(&self)?)

            .fetch_one(db)
            .await?;

        Ok(())
    }

    async fn get(
        db: &crate::Db,
        id: crate::DbId,
    ) -> Result<Self> {
        let row: JsonRow = sqlx::query_as(&format!(
            "SELECT props FROM {} WHERE id = ?",
            Self::TABLE,
        ))
            .bind(id)
            .fetch_one(db)
            .await?;

        let entry: Self = serde_json::from_str(&row.props)?;
        Ok(entry)
    }

    async fn get_with_version(
        db: &crate::Db,
        id: crate::DbId,
        version: crate::DbId,
    ) -> Result<Self> {
        let row: JsonRow = sqlx::query_as(&format!(
            "SELECT props FROM {} WHERE id = ? AND version = ?",
            Self::TABLE,
        ))
            .bind(id)
            .bind(version)
            .fetch_one(db)
            .await?;

        let entry: Self = serde_json::from_str(&row.props)?;
        Ok(entry)
    }

    async fn get_all<'e, 'c, E>(
        db: E,
    ) -> Result<Vec<Self>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let rows: Vec<JsonRow> = sqlx::query_as(&format!(
            "SELECT props FROM {}",
            Self::TABLE,
        ))
            .fetch_all(db)
            .await?;

        let rows = rows.into_iter()
            .map(|row| serde_json::from_str(&row.props))
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    async fn update<'e, 'c, E>(
        &mut self,
        db: E,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        let previous_version = self.version();
        let version_mut = self.version_mut();
        *version_mut = previous_version + 1;

        let json = serde_json::to_string(self)?;

        sqlx::query(&format!(
            r#"
                UPDATE {}
                SET props=?, version=?
                WHERE id=? AND version=?
            "#,
            Self::TABLE,
        ))
            .bind(json)
            .bind(self.version())
            .bind(self.id())
            .bind(previous_version)
            .fetch_one(db)
            .await?;

        Ok(())
    }

    async fn remove<'e, 'c, E>(
        db: E,
        id: crate::DbId,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Sqlite>,
    {
        sqlx::query(&format!(
            r#"
                DELETE FROM {} WHERE id=?
            "#,
            Self::TABLE,
        ))
            .bind(id)
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
