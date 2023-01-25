use super::{DriverComponent, DynDriverComponent};
use crate::driver::DRIVER_REGISTRY;
use erased_serde::serialize_trait_object;
use serde::de::Error as _;
use serde::ser::Error as _;
use serde::{Deserialize, Serialize};

// Implement serde::Serialize for Box<dyn DriverComponent>
serialize_trait_object!(DriverComponent);

/// Structure of component driver data as it is serialized
#[derive(Serialize, Deserialize)]
struct DriverDataSerializationFormat {
    pub driver_name: String,
    pub content: serde_json::Value,
}

impl Serialize for DynDriverComponent {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        DriverDataSerializationFormat {
            driver_name: self.driver().name().to_string(),
            content: serde_json::to_value(&(self.0)).map_err(|e| S::Error::custom(e))?,
        }
        .serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for DynDriverComponent {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        // Deserialize the driver name and the driver component as a json value
        let DriverDataSerializationFormat {
            driver_name,
            content,
        } = serde::Deserialize::deserialize(deserializer)?;

        // Get the driver from the registry by name
        let driver = DRIVER_REGISTRY
            .get()
            .expect("Driver registery not initiated")
            .get(&driver_name)
            .ok_or_else(|| {
                D::Error::custom(format!(
                    "Driver {:?} not found for serialized component",
                    driver_name
                ))
            })?;

        // Deserialize the boxed dyn struct from the component's json value
        let boxed_driver_component = driver
            .component_from_value(content)
            .map_err(|e| D::Error::custom(e))?;

        // Retun the boxed struct wrapped in an instance of this struct
        // so it can be re-serialized in the future
        Ok(Self(boxed_driver_component))
    }
}
