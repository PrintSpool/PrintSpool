#[macro_use] extern crate tracing;
#[macro_use] extern crate derive_new;
#[macro_use] extern crate smart_default;
#[macro_use] extern crate nanoid;

use std::sync::Arc;
use arc_swap::ArcSwap;
use std::collections::HashMap;

pub mod components;

pub mod config;
pub use config::resolvers::query_resolvers::ConfigQuery;
pub use config::resolvers::mutation_resolvers::ConfigMutation;

pub mod machine;
pub use machine::resolvers::query_resolvers::MachineQuery;
pub use machine::resolvers::mutation_resolvers::MachineMutation;

pub mod plugins;
pub mod task;

mod video;
pub use video::video_query_resolvers::VideoQuery;
pub use video::video_mutation_resolvers::VideoMutation;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = teg_json_store::DbId;

/// GraphQL Context containing all the machine xactor addresses for message passing.
pub type MachineMapLocal = HashMap<async_graphql::ID, xactor::Addr<machine::Machine>>;
pub type MachineMap = Arc<ArcSwap<MachineMapLocal>>;
