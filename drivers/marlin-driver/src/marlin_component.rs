use printspool_driver_interface::capability::{AxisOrientation, GCodeAlias, Movement, C};

use crate::components::{axis::Axis, build_platform::BuildPlatform, extruder::Extruder};

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
            Self::Axis(c) => vec![C::Movement(Movement {
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
}
