use serde::{Deserialize, Serialize, de::DeserializeOwned};
use schemars::JsonSchema;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: crate::DbId,
    pub version: crate::DbId,
    pub config: sqlx::types::Json<MaterialConfigEnum>,
}

// CREATE INDEX id ON materials ( json_value(props, 'id') );
// CREATE INDEX id_and_version ON materials ( json_value(props, 'id'), json_value(props, 'version') );
// r#"select * from materials where JSON_EXTRACT(DATA, "$.id") = ?"#

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
