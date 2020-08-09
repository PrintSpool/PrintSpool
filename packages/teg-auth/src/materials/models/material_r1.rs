// Material Revison 1 (LATEST)
use serde::{Deserialize, Serialize};
use async_graphql::ID;

#[derive(Debug, Serialize, Deserialize)]
pub struct Material {
    pub id: ID,
    pub version: u32,
    pub name: String,
    pub props: MaterialType,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum MaterialType {
    FdmFilament(FdmFilament),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FdmFilament {
    pub target_extruder_temperature: f32,
    pub target_bed_temperature: f32,
}
