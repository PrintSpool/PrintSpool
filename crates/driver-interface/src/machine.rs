use self::core_config::MachineCoreConfig;
use crate::DbId;
use crate::{capability::Capability, component::DriverComponent, driver::Driver};
use bonsaidb::core::schema::Collection;
use chrono::prelude::*;
use chrono::{DateTime, Utc};
use derive_more::{Deref, DerefMut};
use derive_new::new;
use eyre::Result;
use schemars::schema::Schema;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use validator::Validate;

pub mod core_config;
pub mod events;
mod gcode_history_entry;
pub mod machine_hooks;
mod machine_viewer;
pub mod messages;
mod positioning_units;
pub mod resolvers;
mod serialization;
mod state;
mod status;

pub use gcode_history_entry::{GCodeHistoryDirection, GCodeHistoryEntry};
pub use machine_viewer::MachineViewer;
pub use positioning_units::PositioningUnits;
pub use state::MachineState;
pub use status::{Errored, MachineStatus, MachineStatusGQL, Printing};

#[derive(Debug, Serialize, Deserialize, Collection, Clone, new)]
#[collection(name = "machines", views = [], natural_id = |entry: Self| entry.id)]
pub struct Machine {
    #[new(default)]
    pub id: DbId<Self>,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    #[new(default)]
    pub deleted_at: Option<DateTime<Utc>>,

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
