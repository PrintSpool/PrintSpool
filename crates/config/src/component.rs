use printspool_klipper_plugin::KlipperComponent;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use validator::Validate;

pub struct Component {
    pub id: crate::DbId,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,

    pub config: DriverConfig,
}

// When and if a plugin system is implemented, these can be refactored to a custom serde Serializer/Deserializer that instantiates trait
// objects (eg. Box<dyn DriverConfig>) from dynamically loaded plugins (eg. WASM or FFI).
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
pub enum DriverConfig {
    Klipper(KlipperComponent),
    Marlin(MarlinComponent),
}

impl Validate for DriverConfig {
    fn validate(&self) -> Result<(), validator::ValidationErrors> {
        match self {
            Self::Klipper(c) => c.validate(),
            Self::Marlin(c) => c.validate(),
        }
    }
}
