use super::ActuatorState;
use printspool_proc_macros::printspool_collection;

mod extruder_resolvers;

#[derive(async_graphql::SimpleObject)]
#[printspool_collection]
pub struct ExtruderState {
    pub actuator: ActuatorState,
}
