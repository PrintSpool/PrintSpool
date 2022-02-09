use chrono::prelude::*;
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use schemars::JsonSchema;
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };
use printspool_json_store::Record;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: crate::DbId,
    pub version: i32,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    // Props
    pub config: MaterialConfigEnum,
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub enum MaterialConfigEnum {
    FdmFilament(Box<FdmFilament>),
}

#[derive(async_graphql::Enum, Copy, Clone, Eq, PartialEq, Debug)]
#[graphql(name = "MaterialType")]
pub enum MaterialTypeGQL {
    #[graphql(name = "FDM_FILAMENT")]
    FdmFilament
}

pub trait MaterialConfig: Serialize + DeserializeOwned {
    fn name(&self) -> &String;
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Default, Clone)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
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

impl Record for Material {
    const TABLE: &'static str = "materials";

    fn id(&self) -> &crate::DbId {
        &self.id
    }

    fn version(&self) -> printspool_json_store::Version {
        self.version
    }

    fn version_mut(&mut self) -> &mut printspool_json_store::Version {
        &mut self.version
    }

    fn created_at(&self) -> DateTime<Utc> {
        self.created_at
    }

    fn deleted_at(&self) -> Option<DateTime<Utc>> {
        self.deleted_at
    }

    fn deleted_at_mut(&mut self) -> &mut Option<DateTime<Utc>> {
        &mut self.deleted_at
    }
}
