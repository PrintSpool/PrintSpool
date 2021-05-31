use chrono::prelude::*;
use serde::{Serialize, de::DeserializeOwned};
use eyre::{
    eyre,
    Result,
    Context as _,
};

#[derive(sqlx::FromRow, Debug)]
pub struct JsonRow {
    pub props: serde_json::Value,
}

#[async_trait::async_trait]
pub trait Record: Sync + Send + Serialize + DeserializeOwned + 'static {
    const TABLE: &'static str;

    fn id(&self) -> &crate::DbId;
    fn version(&self) -> crate::Version;
    fn version_mut(&mut self) -> &mut crate::Version;
    fn created_at(&self) -> DateTime<Utc>;
    fn deleted_at(&self) -> Option<DateTime<Utc>>;
    fn deleted_at_mut(&mut self) -> &mut Option<DateTime<Utc>>;

    // async fn insert<'e, 'c, E>(
    //     &self,
    //     db: E,
    // ) -> Result<Self>
    // where
    //     E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    // {
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
        db: &mut sqlx::Transaction<'c, sqlx::Postgres>,
    ) -> Result<()>
    {
        sqlx::query(&format!(
            r#"
                INSERT INTO {}
                (id, version, created_at, deleted_at, props)
                VALUES ($1, $2, $3, $4, $5)
            "#,
            Self::TABLE,
        ))
            .bind(self.id())
            .bind(self.version())
            .bind(self.created_at())
            .bind(self.deleted_at())
            .bind(serde_json::to_value(&self)?)

            .fetch_optional(db)
            .await?;

        Ok(())
    }

    async fn get_optional<'e, 'c, E>(
        db: E,
        id: &crate::DbId,
        include_deleted: bool,
    ) -> Result<Option<Self>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let deletion_filter = if include_deleted {
            ""
        } else {
            "AND deleted_at IS NULL"
        };

        let sql = format!(
            "SELECT props FROM {} WHERE id = $1 {}",
            Self::TABLE,
            deletion_filter,
        );

        let row: Option<JsonRow> = sqlx::query_as(&sql)
            .bind(id)
            .fetch_optional(db)
            .await?;

        let entry: Option<Self> = row.map(|row| Self::from_row(row)).transpose()?;
        Ok(entry)
    }

    async fn get<'e, 'c, E>(
        db: E,
        id: &crate::DbId,
        include_deleted: bool,
    ) -> Result<Self>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let entry = Self::get_optional(
            db,
            id,
            include_deleted,
        )
            .await?
            .ok_or_else(|| eyre!("Could not find {} (id: {})", Self::TABLE, id))?;

        Ok(entry)
    }

    async fn get_with_version<'e, 'c, E>(
        db: E,
        id: &crate::DbId,
        version: crate::Version,
        include_deleted: bool,
    ) -> Result<Self>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let deletion_filter = if include_deleted {
            ""
        } else {
            "AND deleted_at IS NULL"
        };

        let sql = format!(
            "SELECT props FROM {} WHERE id = $1 {} AND version = $2",
            Self::TABLE,
            deletion_filter,
        );

        let row: JsonRow = sqlx::query_as(&sql)
            .bind(id)
            .bind(version)
            .fetch_one(db)
            .await?;

        let entry: Self = Self::from_row(row)?;
        Ok(entry)
    }

    async fn get_by_ids<'e, 'c, E>(
        db: E,
        ids: &Vec<crate::DbId>,
        include_deleted: bool,
    ) -> Result<Vec<Self>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let deletion_filter = if include_deleted {
            ""
        } else {
            "AND deleted_at IS NULL"
        };

        let sql = format!(
            "SELECT props FROM {} WHERE id IN ({}) {}",
            Self::TABLE,
            ids.iter().map(|_| "?").collect::<Vec<_>>().join(", "),
            deletion_filter,
        );

        let mut query = sqlx::query_as(&sql);

        for id in ids {
            query = query.bind(id);
        }

        let rows: Vec<JsonRow> = query
            .fetch_all(db)
            .await
            .wrap_err_with(|| format!("Could not get {}", Self::TABLE))?;

        Ok(Self::from_rows(rows)?)
    }

    async fn get_all<'e, 'c, E>(
        db: E,
        include_deleted: bool,
    ) -> Result<Vec<Self>>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let deletion_filter = if include_deleted {
            ""
        } else {
            "WHERE deleted_at IS NULL"
        };

        let sql = format!(
            "SELECT props FROM {} {}",
            Self::TABLE,
            deletion_filter,
        );

        let rows: Vec<JsonRow> = sqlx::query_as(&sql)
            .fetch_all(db)
            .await?;

        Ok(Self::from_rows(rows)?)
    }

    fn from_rows<I: IntoIterator<Item = JsonRow>>(
        rows: I
    ) -> Result<Vec<Self>>
    {
        let rows = rows.into_iter()
            .map(Self::from_row)
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    fn from_row(
        row: JsonRow
    ) -> Result<Self>
    {
        let record = serde_json::from_value(row.props)?;
        Ok(record)
    }

    fn prep_for_update(&mut self) -> Result<(serde_json::Value, crate::Version)> {
        let previous_version = self.version();
        let version_mut = self.version_mut();
        *version_mut = previous_version + 1;

        let json = serde_json::to_value(self)?;

        Ok((json, previous_version))
    }

    async fn update<'e, 'c, E>(
        &mut self,
        db: E,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        let (json, previous_version) = self.prep_for_update()?;

        sqlx::query(&format!(
            r#"
                UPDATE {}
                SET
                    props=$1,
                    version=$2,
                    deleted_at=$3
                WHERE
                    id=$4
                    AND version=$5
            "#,
            Self::TABLE,
        ))
            // set
            .bind(json)
            .bind(self.version())
            .bind(self.deleted_at())
            // where
            .bind(self.id())
            .bind(previous_version)
            .fetch_optional(db)
            .await?;

        Ok(())
    }

    async fn remove<'e, 'c, E>(
        &mut self,
        db: E,
        hard_delete: bool,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        if hard_delete {
            sqlx::query(&format!(
                r#"
                    DELETE FROM {} WHERE id=$1
                "#,
                Self::TABLE,
            ))
                .bind(self.id())
                .fetch_optional(db)
                .await?;
        } else {
            *self.deleted_at_mut() = Some(Utc::now());
            self.update(db).await?;
        }

        Ok(())
    }

    async fn remove_if_unchanged<'e, 'c, E>(
        &mut self,
        db: E,
        hard_delete: bool,
    ) -> Result<()>
    where
        E: 'e + sqlx::Executor<'c, Database = sqlx::Postgres>,
    {
        if hard_delete {
            sqlx::query(&format!(
                r#"
                    DELETE FROM {} WHERE id=$1 AND version=$2
                "#,
                Self::TABLE,
            ))
                .bind(self.id())
                .bind(self.version())
                .fetch_optional(db)
                .await?;
        } else {
            *self.deleted_at_mut() = Some(Utc::now());
            self.update(db).await?;
        }

        Ok(())
    }
}
