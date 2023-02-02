mod actuator;
mod camera;
mod fan;
mod heater;

pub use actuator::*;
pub use build_platform::*;
pub use camera::*;
pub use component_inner::ComponentInner;
pub use fan::*;
pub use heater::*;
pub use toolhead::*;

// Conceptual Future Examples
// (Don't expect these examples to work, it's just a loose idea of what I'd like things to look like in the future)
//     - toolheads:
//         - Mill or Lathe:
//             `vec![C::SpindleSpeed, C::ToolSelect]`
//         - Syringe Paste Extruder:
//             `vec![C::Extruder]`
//         - Laser Cutter:
//             `vec![C::Laser]`
//         - FDM Extruder:
//             `vec![C::Extruder, C::Heater(..), C::TemperatureSensor(..), C::Fan(..)]`
//         - FDM Extruder with independent hotend fan and print cooling fans:
//             `vec![C::Extruder, C::Heater(..), C::TemperatureSensor(..), C::Fan(GCodeAlias { name: "hotend", "f0" }), C::Fan(GCodeAlias { name: "print-cooling", "f1" })]`
//         - Independent-Carrage FDM extruders:
//             `vec![C::Extruder, C::Heater(..), C::TemperatureSensor(..), C::Fan, C::Actuator { axis: Axis::LinearX, .. })]`
//     - beds
//         - Unheated bed:
//             `vec![C::Bed]`
//         - Heated bed:
//             `vec![C::Bed, C::Heater, C::TemperatureSensor]`
//     - positioning:
//         - 3 Axis (Cartesian):
//             `vec![
//                 C::Actuator { axis: Axis::LinearX, .. }),
//                 C::Actuator { axis: Axis::LinearY, .. }),
//                 C::Actuator { axis: Axis::LinearZ, .. }),
//             ])]`
//         - 5 Axis (Cartesian):
//             `vec![
//                 C::Actuator { axis: Axis::LinearX, .. }),
//                 C::Actuator { axis: Axis::LinearY, .. }),
//                 C::Actuator { axis: Axis::LinearZ, .. }),
//                 C::Actuator { axis: Axis::RotationX, .. }),
//                 C::Actuator { axis: Axis::RotationZ, .. }),
//             ]`
//         - 2 Axis (Non-Cartesian - meaning these have no meaningful or fixed orientation relative to one another):
//             `vec![
//                 C::Actuator { axis: Axis::NonCartesian, alias: { name: "Elbow", .. }, .. }),
//                 C::Actuator { axis: Axis::NonCartesian, alias: { name: "Wrist", .. }, .. }),
//             ])]`

/// A set of additive tokens for indicating the capabilities of a component in a 3D printer or CNC machine.
///
/// Each component can act as one or more capabilities. For example a stepper controller might act as a Capability::Actuator.
///
/// These can be used to procedurally render component-appropriate UIs through composition instead of having to define
/// exponentially more UIs for each permutation of capabilities.
pub enum Capability {
    Extruder(GCodeAlias),
    // SpindleSpeed,
    // Laser,
    // ToolSelect,
    Fan(GCodeAlias),
    Heater(GCodeAlias),
    TemperatureSensor(GCodeAlias),
    /// Actuators produce linear or rotational movement
    Actuator(Actuator),
    Bed,
    Camera,
}

pub type C = Capability;

pub struct GCodeAlias {
    /// A short, human-readable title for this capability
    pub name: String,
    /// The address used in GCode to reference this capaility (eg. "e0", "f2" or "x")
    pub address: String,
}

pub trait HasCapabilities {
    fn capabilities(&self) -> Vec<Capability>;
}
