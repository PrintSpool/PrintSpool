use chrono::prelude::*;
use serde::{Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use sqlx::Row as _;

use crate::Record;

#[async_trait::async_trait]
pub trait UnsavedRecord<T: Record>: Sync + Serialize + 'static {
    async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<T> {
        let db = db.begin().await?;

        let (record, db) = self.insert_no_rollback(db).await?;

        db.commit().await?;

        Ok(record)
    }

    /// Insert but without a transaction. Intended to be used inside functions that provide their
    /// own transactions.
    async fn insert_no_rollback<'c>(
        &self,
        mut db: sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<(T, sqlx::Transaction<'c, sqlx::Sqlite>)> {
        // Generate an ID for the row
        self.query_sqlx(&mut db)
            .await?;

        let id: crate::DbId = sqlx::query(
            "SELECT last_insert_rowid() as id"
        )
            .fetch_one(&mut db)
            .await?
            .get("id");

        // Add the sqlite-generated monotonic ID and other default fields in to the json
        let mut json = serde_json::to_value(self)?;
        let map = json
            .as_object_mut()
            .expect("Struct incorrectly serialized for JsonRow insert");

        map.insert("id".to_string(), id.into());
        map.insert("version".to_string(), 0.into());
        map.insert("created_at".to_string(), serde_json::to_value(Utc::now())?);

        // Update Sqlite - adding the modified JSON including the ID
        let mut record: T = serde_json::from_value(json)?;
        record.update(&mut db).await?;

        Ok((record, db))
    }

    async fn query_sqlx<'c>(
        &self,
        db: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
    ) -> Result<()> {
        sqlx::query(&format!(
            r#"
                INSERT INTO {}
                (props, version)
                VALUES ("{{}}", 0)
            "#,
            T::TABLE,
        ))
            .fetch_one(db)
            .await?;
        Ok(())
    }
}
