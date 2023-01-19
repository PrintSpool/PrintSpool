use std::collections::HashMap;

use arc_swap::ArcSwap;
use lazy_static::lazy_static;
use schemars::JsonSchema;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use validator::Validate;

pub struct Component {
    pub id: crate::DbId,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,

    pub driver_data: DriverComponent,
}

// // When and if a plugin system is implemented, these can be refactored to a custom serde Serializer/Deserializer that instantiates trait
// // objects (eg. Box<dyn DriverConfig>) from dynamically loaded plugins (eg. WASM or FFI).
// #[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
// pub enum DriverConfig {
//     Klipper(KlipperComponent),
//     Marlin(MarlinComponent),
// }

// impl Validate for DriverConfig {
//     fn validate(&self) -> Result<(), validator::ValidationErrors> {
//         match self {
//             Self::Klipper(c) => c.validate(),
//             Self::Marlin(c) => c.validate(),
//         }
//     }
// }

pub trait Driver {
    /// Deserialize a component defined in this driver
    fn deserialize_component<'de, D>(deserializer: D) -> Result<Box<dyn DriverComponent>, D::Error>
    where
        D: serde::Deserializer<'de>;

    /// Gets the JSON Schema for the component types defined in the driver
    fn json_schema(gen: &mut schemars::gen::SchemaGenerator) -> schemars::schema::Schema;
}

lazy_static! {
    pub static ref drivers: ArcSwap<HashMap<String, &'static dyn Driver>> = Default::default();
}

pub struct DynDriverComponent(Box<dyn DriverComponent>);

impl std::ops::Deref for DynDriverComponent {
    type Target = Box<dyn DriverComponent>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::ops::DerefMut for DynDriverComponent {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl Serialize for DynDriverComponent {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        // Serialize the driver name of the component
        todo!();
        // Serialize the component's data
        todo!();
    }
}

impl<'de> Deserialize<'de> for DynDriverComponent {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        // Deserialize the driver name of the component
        let driver_name = todo!();
        let driver = drivers.get(driver_name)?;
        // Deserialize the component's data
        driver.deserialize_component(todo!());
    }
}

pub trait DriverComponent:
    Clone + std::fmt::Debug + Serialize + DeserializeOwned + Validate + JsonSchema
{
    fn driver_name() -> &'static str;
}
