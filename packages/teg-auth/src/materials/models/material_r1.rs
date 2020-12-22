// Material Revison 1 (LATEST)
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Material {
    pub id: u32,
    pub version: u32,
    pub name: String,
    pub props: MaterialType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MaterialType {
    FdmFilament(FdmFilament),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FdmFilament {
    pub target_extruder_temperature: f32,
    pub target_bed_temperature: f32,
}
