use self::core_config::MachineCoreConfig;
use self::machine_hooks::MachineHooks;
use crate::{component::DriverComponent, driver::Driver};
use async_graphql::Context;
use derive_more::{Deref, DerefMut};
use derive_new::new;
use eyre::Result;
use printspool_proc_macros::printspool_collection;
use std::sync::Arc;
use validator::Validate;

pub mod core_config;
pub mod events;
mod gcode_history_entry;
pub mod machine_hooks;
pub mod positioning_units;
mod serialization;
pub mod state;
pub mod status;

pub use gcode_history_entry::{GCodeHistoryDirection, GCodeHistoryEntry};
pub use positioning_units::PositioningUnits;
pub use state::MachineState;
pub use status::{Errored, MachineStatus, MachineStatusKey, Printing};

pub type MachineHooksList = Arc<Vec<&'static dyn MachineHooks>>;

#[printspool_collection]
pub struct Machine {
    pub core_config: MachineCoreConfig,
    pub driver_config: DynDriverMachine,
}

#[derive(Deref, DerefMut, Debug, Clone)]
pub struct DynDriverMachine(Box<dyn DriverMachine>);

#[dyn_clonable::clonable]
pub trait DriverMachine:
    Clone + Sync + Send + std::fmt::Debug + erased_serde::Serialize + Validate
{
    fn driver(&self) -> &'static dyn Driver;
}

pub struct MachineLayout {
    pub machine: Box<dyn DriverMachine>,
    pub components: Vec<Box<dyn DriverComponent>>,
}

impl Machine {
    pub async fn load_state(&self, ctx: &Context<'_>) -> Result<MachineState> {
        MachineState::load_by_machine_id(self.deleted_at.into(), self.id, ctx).await
    }
}
