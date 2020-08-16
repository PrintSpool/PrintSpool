use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod material_r1;
pub use material_r1::{
    Material,
    MaterialType,
    FdmFilament,
};

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum MaterialDBEntry {
    MaterialR1 (material_r1::Material),
}

impl crate::models::VersionedModel for Material {
    type Entry = MaterialDBEntry;
    const NAMESPACE: &'static str = "Material";

    fn get_id(&self) -> u64 {
        self.id
    }
}
