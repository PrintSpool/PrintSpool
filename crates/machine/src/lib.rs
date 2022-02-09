#[macro_use] extern crate tracing;
#[macro_use] extern crate derive_new;
#[macro_use] extern crate smart_default;
#[macro_use] extern crate nanoid;
#[macro_use] extern crate lazy_static;

use std::sync::Arc;
use arc_swap::ArcSwap;
use std::collections::HashMap;

pub mod components;
pub use components::resolvers::component_mutation_resolvers::ComponentMutation;

pub mod config;
pub use config::resolvers::query_resolvers::ConfigQuery;
pub use config::resolvers::mutation_resolvers::ConfigMutation;

pub mod machine;
pub use machine::resolvers::machines_query_resolvers::MachineQuery;
pub use machine::resolvers::mutation_resolvers::MachineMutation;

pub mod plugins;
pub mod signalling_updater;
pub mod task;

pub use printspool_common::paths;

mod video;
pub use video::video_query_resolvers::VideoQuery;
pub use video::video_mutation_resolvers::VideoMutation;

mod machine_material_hooks;
pub use machine_material_hooks::MachineMaterialHooks;

pub type Db = sqlx::PgPool;
pub type DbId = printspool_json_store::DbId;

/// GraphQL Context containing all the machine xactor addresses for message passing.
pub type MachineMapLocal = HashMap<async_graphql::ID, xactor::Addr<machine::Machine>>;
pub type MachineMap = Arc<ArcSwap<MachineMapLocal>>;

pub use machine::machine_hooks::MachineHooks;
pub type MachineHooksList = Arc<Vec<Box<dyn MachineHooks + Send + Sync>>>;

use chrono::prelude::*;

lazy_static! {
    pub static ref PROCESS_STARTED_AT: DateTime<Utc> = Utc::now();
}

pub fn initialize_statics() {
    lazy_static::initialize(&PROCESS_STARTED_AT);
}
