use serde::{Deserialize, Serialize, de::DeserializeOwned};
use schemars::JsonSchema;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use async_graphql::{
    ID,
    Context,
    FieldResult,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: crate::DbId,
    pub version: crate::DbId,
    pub config: MaterialConfigEnum,
}

pub struct Query();

#[async_graphql::Object]
impl Query {
    async fn materials<'ctx>(&self, ctx: &'ctx Context<'_>,) -> FieldResult<Vec<Material>> {
        let db: &crate::Db = ctx.data()?;

        let materials = Material::get_all(&db).await?;

        Ok(materials)
    }
}

#[async_graphql::Object]
impl Material {
    async fn id(&self) -> ID {
        self.id.into()
    }
    // TODO: Material GraphQL!
    // type Material {
    //     id: ID!
    //     type: String!
    //     name: String!
    //     shortSummary: String!
    //     configForm: ConfigForm!
    //   }
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

// TODO: Create a macro to generate this JSON Store code
// -------------------------------------------------------------
struct JsonRow {
    pub props: String,
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

    pub async fn insert(
        &self,
        db: &crate::Db,
    ) -> Result<()> {
        let json = serde_json::to_string(self)?;
 
        sqlx::query!(
            r#"
                INSERT INTO materials
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

    pub async fn update(
        &mut self,
        db: &crate::Db,
    ) -> Result<()> {
        let previous_version = self.version;
        self.version = self.version + 1;

        let json = serde_json::to_string(self)?;

        sqlx::query!(
            r#"
                UPDATE tasks
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
