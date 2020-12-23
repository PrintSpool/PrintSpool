use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: crate::DbId,
    pub version: crate::DbId,
    pub name: String,
    pub props: sqlx::types::Json<MaterialType>,
}

// CREATE INDEX id ON materials ( json_value(props, 'id') );
// CREATE INDEX id_and_version ON materials ( json_value(props, 'id'), json_value(props, 'version') );
// r#"select * from materials where JSON_EXTRACT(DATA, "$.id") = ?"#

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaterialType {
    FdmFilament(FdmFilament),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FdmFilament {
    pub target_extruder_temperature: f32,
    pub target_bed_temperature: f32,
}
