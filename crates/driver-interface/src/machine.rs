use self::core_config::MachineCoreConfig;
use self::machine_hooks::MachineHooks;
use crate::DbId;
use crate::{component::DriverComponent, driver::Driver};
use async_graphql::Context;
use bonsaidb::core::schema::Collection;
use chrono::{DateTime, Utc};
use derive_more::{Deref, DerefMut};
use derive_new::new;
use eyre::Result;
use printspool_proc_macros::printspool_collection;
use serde::{Deserialize, Serialize};
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
pub use status::{Errored, MachineStatus, MachineStatusGQL, Printing};

pub type MachineHooksList = Arc<Vec<Box<dyn MachineHooks>>>;

#[printspool_collection]
pub struct Machine {
    pub core_config: MachineCoreConfig,
    pub driver_config: DynDriverMachine,
}

#[derive(Deref, DerefMut)]
pub struct DynDriverMachine(Box<dyn DriverMachine>);

#[dyn_clonable::clonable]
pub trait DriverMachine: Clone + std::fmt::Debug + erased_serde::Serialize + Validate {
    fn driver(&self) -> &'static dyn Driver;
}

pub struct MachineLayout {
    machine: Box<dyn DriverMachine>,
    components: Vec<Box<dyn DriverComponent>>,
}

impl Machine {
    pub async fn load_state(&self, ctx: &Context<'_>) -> Result<MachineState> {
        MachineState::load_by_id(self.deleted_at.into(), self.id, ctx).await
    }
}
