// Conceptual Future Examples
// (Don't expect these examples to work, it's just a loose idea of what I'd like things to look like in the future)
//     - toolheads:
//         - Mill or Lathe:
//             `vec![C::Toolhead, C::SpindleSpeed, C::ToolSelect]`
//         - Syringe Paste Extruder:
//             `vec![C::Toolhead, C::Extruder]`
//         - Laser Cutter:
//             `vec![C::Toolhead, C::Laser]`
//         - FDM Extruder:
//             `vec![C::Toolhead, C::Extruder, C::Heater(..), C::TemperatureSensor(..), C::Fan(..)]`
//         - FDM Extruder with independent hotend fan and print cooling fans:
//             `vec![C::Toolhead, C::Extruder, C::Heater(..), C::TemperatureSensor(..), C::Fan(GCodeAlias { name: "hotend", "f0" }), C::Fan(GCodeAlias { name: "print-cooling", "f0" })]`
//         - Independent-Carrage FDM extruders:
//             `vec![C::Toolhead, C::Extruder, C::Heater(..), C::TemperatureSensor(..), C::Fan, C::Movement { axis: Axis::LinearX, .. })]`
//     - beds
//         - Unheated bed:
//             `vec![C::Bed]`
//         - Heated bed:
//             `vec![C::Bed, C::Heater, C::TemperatureSensor]`
//     - positioning:
//         - 3 Axis (Cartesian):
//             `vec![
//                 C::Movement { axis: Axis::LinearX, .. }),
//                 C::Movement { axis: Axis::LinearY, .. }),
//                 C::Movement { axis: Axis::LinearZ, .. }),
//             ])]`
//         - 5 Axis (Cartesian):
//             `vec![
//                 C::Movement { axis: Axis::LinearX, .. }),
//                 C::Movement { axis: Axis::LinearY, .. }),
//                 C::Movement { axis: Axis::LinearZ, .. }),
//                 C::Movement { axis: Axis::RotationX, .. }),
//                 C::Movement { axis: Axis::RotationZ, .. }),
//             ]`
//         - 2 Axis (Non-Cartesian - meaning these have no meaningful or fixed orientation relative to one another):
//             `vec![
//                 C::Movement { axis: Axis::NonCartesian, alias: { name: "Elbow", .. }, .. }),
//                 C::Movement { axis: Axis::NonCartesian, alias: { name: "Wrist", .. }, .. }),
//             ])]`

/// A set of additive tokens for indicating the capabilities of a component in a 3D printer or CNC machine.
///
/// These can be used to procedurally render component-appropriate UIs through composition instead of having to define
/// exponentially more UIs for each permutation of capabilities.
pub enum Capability {
    Toolhead,
    Extruder,
    // SpindleSpeed,
    // Laser,
    // ToolSelect,
    Fan(GCodeAlias),
    Heater(GCodeAlias),
    TemperatureSensor(GCodeAlias),
    Movement(Movement),
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

pub struct Movement {
    /// visual orientation of the axis of movement with respect to the other axes of movement within this component.
    pub axis: AxisOrientation,
    pub alias: GCodeAlias,
    pub can_home_start: bool,
    pub can_home_end: bool,
}

pub enum AxisOrientation {
    LinearX,
    LinearY,
    LinearZ,
    // RotationX,
    // RotationY,
    // RotationZ,
    // NonCartesian(String),
}

pub trait HasCapabilities {
    fn capabilities(&self) -> Vec<Capability>;
}
