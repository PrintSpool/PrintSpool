use xactor::Actor;
pub mod messages;
pub mod socket;

#[path = "messages/spool_task.rs"]
mod spool_task;
use spool_task::spool_task;

#[path = "messages/stop_and_reset.rs"]
pub mod stop_and_reset;

#[path = "messages/pause_task.rs"]
mod pause_task;
pub use pause_task::pause_task;

#[path = "messages/delete_task_history.rs"]
mod delete_task_history;
pub use delete_task_history::delete_task_history;

#[path = "mutations/continue_viewing_machine.rs"]
mod continue_viewing_machine;
pub use continue_viewing_machine::ContinueViewingMachineMutation;

#[path = "mutations/estop_and_reset.mutation.rs"]
mod estop_and_reset;
pub use estop_and_reset::EStopAndResetMutation;

mod component_resolvers;
mod machine_resolvers;
pub mod query_resolvers;
pub mod models;

pub struct Machine;

impl Actor for Machine {}
