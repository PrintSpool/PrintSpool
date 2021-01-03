use chrono::prelude::*;
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use schemars::JsonSchema;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: crate::DbId,
    pub version: crate::DbId,
    pub config: MaterialConfigEnum,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub enum MaterialConfigEnum {
    FdmFilament(Box<FdmFilament>),
}

pub trait MaterialConfig: Serialize + DeserializeOwned {
    fn name(&self) -> &String;
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub struct FdmFilament {
    /// # Name
    pub name: String,
    /// # Target Extruder Temperature
    pub target_extruder_temperature: f32,
    /// # Target Bed Temperature
    pub target_bed_temperature: f32,
}

impl MaterialConfig for FdmFilament {
    fn name(&self) -> &String {
        &self.name
    }
}


impl Material {
    pub async fn create(
        db: &crate::Db,
        json: serde_json::Value,
    ) -> Result<Self> {
        let material = UnsavedMaterial {
            config: serde_json::from_value(json)?,
        };

        let material = material.insert(db).await?;

        Ok(material)
    }

    pub async fn update_from_mutation(
        db: &crate::Db,
        id: crate::DbId,
        version: crate::DbId,
        model: serde_json::Value,
    ) -> Result<Self> {
        let mut invite = Self::get_with_version(db, id, version).await?;

        invite.config = serde_json::from_value(model)?;

        invite.update(db).await?;

        Ok(invite)
    }
}
// TODO: Create a macro to generate this JSON Store code
// -------------------------------------------------------------
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedMaterial {
    pub config: MaterialConfigEnum,
}

struct JsonRow {
    pub props: String,
}

impl UnsavedMaterial {
    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<Material> {
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
    ) -> Result<(Material, sqlx::Transaction<'c, sqlx::Sqlite>)> {
        // Generate an ID for the row
        sqlx::query!(
            r#"
                INSERT INTO materials
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
                UPDATE materials
                SET props=?
                WHERE id=?
            "#,
            json_string,
            id,
        )
            .fetch_one(&mut db)
            .await?;

        let entry: Material = serde_json::from_value(json)?;

        Ok((entry, db))
    }
}

impl Material {
    pub async fn get(
        db: &crate::Db,
        id: crate::DbId,
    ) -> Result<Self> {
        let row = sqlx::query_as!(
            JsonRow,
            "SELECT props FROM materials WHERE id = ?",
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
            "SELECT props FROM materials WHERE id = ? AND version = ?",
            id,
            version,
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
            "SELECT props FROM materials",
        )
            .fetch_all(db)
            .await?;

        let rows = rows.into_iter()
            .map(|row| serde_json::from_str(&row.props))
            .collect::<std::result::Result<Vec<_>, _>>()?;

        Ok(rows)
    }

    pub async fn update(
        &mut self,
        db: &crate::Db,
    ) -> Result<()> {
        let previous_version = self.version;
        self.version = self.version + 1;

        let json = serde_json::to_string(self)?;

        sqlx::query!(
            r#"
                UPDATE materials
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
                DELETE FROM materials WHERE id=?
            "#,
            id,
        )
            .fetch_optional(db)
            .await?;

        Ok(())
    }
}
