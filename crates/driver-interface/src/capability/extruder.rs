use super::ActuatorState;
use printspool_proc_macros::printspool_collection;

#[printspool_collection]
pub struct ExtruderState {
    pub actuator: ActuatorState,
}
