use super::GCodeAlias;
use printspool_proc_macros::printspool_collection;

pub struct Actuator {
    /// visual orientation of the axis of Actuator with respect to the other axes of Actuator within this component.
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

#[printspool_collection]
pub struct ActuatorState {
    /// The target position in mm.
    pub target_position: Option<f32>,
    /// The current position in mm.
    pub actual_position: Option<f32>,
    pub homed: bool,
}
