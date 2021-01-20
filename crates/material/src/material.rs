use serde::{Deserialize, Serialize, de::DeserializeOwned};
use schemars::JsonSchema;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_json_store::{Record, UnsavedRecord};

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
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnsavedMaterial {
    pub config: MaterialConfigEnum,
}


impl Record for Material {
    const TABLE: &'static str = "materials";

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
impl UnsavedRecord<Material> for UnsavedMaterial {}
