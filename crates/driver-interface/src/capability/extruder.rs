use super::ActuatorState;
use printspool_proc_macros::printspool_collection;

#[derive(async_graphql::SimpleObject)]
#[printspool_collection]
pub struct ExtruderState {
    pub actuator: ActuatorState,
}
