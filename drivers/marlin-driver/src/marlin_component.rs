use printspool_driver_interface::{
    capability::{Actuator, AxisOrientation, GCodeAlias, C},
    component::ComponentTypeDescriptor,
};

use crate::components::{axis::Axis, build_platform::BuildPlatform, extruder::Extruder};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum MarlinComponent {
    Axis(Axis),
    BuildPlatform(BuildPlatform),
    Fan(Fan),
    Extruder(Extruder),
}

impl printspool_driver_interface::component::DriverComponent for MarlinComponent {
    fn driver(&self) -> &'static dyn Driver {
        &KlipperDriverFactory
    }

    fn capabilities(&self) -> Vec<printspool_driver_interface::capability::Capability> {
        match self {
            Self::Axis(c) => vec![C::Actuator(Actuator {
                axis: match &c.address.to_lowercase() {
                    "x" => AxisOrientation::LinearX,
                    "y" => AxisOrientation::LinearY,
                    _ => AxisOrientation::LinearZ,
                },
                alias: GCodeAlias {
                    name: c.name,
                    address: c.address,
                },
                can_home_start: true,
                can_home_end: false,
            })],
            Self::BuildPlatform(c) => vec![C::Heater(GCodeAlias {
                name: c.name,
                address: c.address,
            })],
            Self::Fan(c) => vec![C::Fan(GCodeAlias {
                name: c.name,
                address: c.address,
            })],
            Self::Extruder(c) => vec![
                C::Extruder(GCodeAlias {
                    name: c.name,
                    address: c.address,
                }),
                C::Heater(GCodeAlias {
                    name: c.name,
                    address: c.address,
                }),
            ],
            _ => todo!(),
        }
    }

    fn type_descriptor(&self) -> ComponentTypeDescriptor {
        match self {
            MarlinComponent::Axis(_) => Axis::type_descriptor(),
            MarlinComponent::BuildPlatform(_) => BuildPlatform::type_descriptor(),
            MarlinComponent::Fan(_) => Fan::type_descriptor(),
            MarlinComponent::Extruder(_) => Extruder::type_descriptor(),
        }
    }
}
