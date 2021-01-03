use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MachineViewer {
    pub id: crate::DbId,
    pub version: crate::DbId,
    pub created_at: DateTime<Utc>,

    // Foreign Keys
    pub machine_id: crate::DbId,
    pub user_id: crate::DbId,
    // Timestamps
    pub expires_at: DateTime<Utc>,
}

impl MachineViewer {
    pub async fn continue_viewing(&mut self, db: &crate::Db) -> Result<()> {
        self.expires_at = Utc::now() + chrono::Duration::seconds(5);
        self.update(db).await?;
        Ok(())
    }

    pub fn is_expired(&self) -> bool {
        self.expires_at < Utc::now()
    }
}

// TODO: Create a macro to generate this JSON Store code
// -------------------------------------------------------------
#[derive(new, Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedMachineViewer {
    // Foreign Keys
    pub machine_id: crate::DbId,
    pub user_id: crate::DbId,
    // Timestamps
    #[new(value = "Utc::now() + chrono::Duration::seconds(5)")]
    pub expires_at: DateTime<Utc>,
}

struct JsonRow {
    pub props: String,
}

impl UnsavedMachineViewer {
    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<MachineViewer> {
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
    ) -> Result<(MachineViewer, sqlx::Transaction<'c, sqlx::Sqlite>)> {
        // Generate an ID for the row
        sqlx::query!(
            r#"
                INSERT INTO machine_viewers
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
                UPDATE machine_viewers
                SET props=?
                WHERE id=?
            "#,
            json_string,
            id,
        )
            .fetch_one(&mut db)
            .await?;

        let entry: MachineViewer = serde_json::from_value(json)?;

        Ok((entry, db))
    }
}

impl MachineViewer {
    pub async fn get(
        db: &crate::Db,
        id: crate::DbId,
    ) -> Result<Self> {
        let row = sqlx::query_as!(
            JsonRow,
            "SELECT props FROM machine_viewers WHERE id = ?",
            id
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
    //         "SELECT props FROM machine_viewers WHERE public_key = ?",
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
            "SELECT props FROM machine_viewers",
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
                UPDATE machine_viewers
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
                DELETE FROM machine_viewers WHERE id=?
            "#,
            id,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
