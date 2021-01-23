use chrono::prelude::*;
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use schemars::JsonSchema;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    // Props
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
        let material = Material {
            id: nanoid!(11),
            version: 0,
            created_at: Utc::now(),
            config: serde_json::from_value(json)?,
        };

        material.insert(db).await?;

        Ok(material)
    }

    pub async fn update_from_mutation(
        db: &crate::Db,
        id: &crate::DbId,
        version: teg_json_store::Version,
        model: serde_json::Value,
    ) -> Result<Self> {
        let mut invite = Self::get_with_version(db, id, version).await?;

        invite.config = serde_json::from_value(model)?;

        invite.update(db).await?;

        Ok(invite)
    }
}

impl Record for Material {
    const TABLE: &'static str = "materials";

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
