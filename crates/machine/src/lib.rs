#[macro_use]
extern crate tracing;
#[macro_use]
extern crate derive_new;
#[macro_use]
extern crate smart_default;
#[macro_use]
extern crate nanoid;
#[macro_use]
extern crate lazy_static;

use arc_swap::ArcSwap;
use std::collections::HashMap;
use std::sync::Arc;

pub mod components;
pub use components::resolvers::component_mutation_resolvers::ComponentMutation;

pub mod config;
pub use config::resolvers::mutation_resolvers::ConfigMutation;
pub use config::resolvers::query_resolvers::ConfigQuery;

pub mod machine;
pub use machine::resolvers::machines_query_resolvers::MachineQuery;
pub use machine::resolvers::mutation_resolvers::MachineMutation;

pub mod plugins;
pub mod signalling_updater;
pub mod task;

pub use printspool_common::paths;

mod video;
pub use video::video_mutation_resolvers::VideoMutation;
pub use video::video_query_resolvers::VideoQuery;

mod machine_material_hooks;
pub use machine_material_hooks::MachineMaterialHooks;

pub type Db = sqlx::PgPool;
pub type DbId = printspool_json_store::DbId;

pub type VideoCaptureStreamMap = Arc<DashMap<PathBuf, machine::video::VideoCaptureStream>>;

pub type WebRTCSessionSet = Arc<DashSet::new<machine::video::WebRTCSession>>;

use chrono::prelude::*;

lazy_static! {
    pub static ref PROCESS_STARTED_AT: DateTime<Utc> = Utc::now();
}

pub fn initialize_statics() {
    lazy_static::initialize(&PROCESS_STARTED_AT);
}
