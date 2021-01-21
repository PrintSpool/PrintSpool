#[macro_use] extern crate tracing;
#[macro_use] extern crate derive_new;
#[macro_use] extern crate smart_default;

use std::sync::Arc;
use arc_swap::ArcSwap;
use std::collections::HashMap;

pub mod components;
pub mod config;
pub mod machine;
pub mod plugins;
pub mod task;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = teg_json_store::DbId;

/// GraphQL Context containing all the machine xactor addresses for message passing.
pub type MachineMapLocal = HashMap<async_graphql::ID, xactor::Addr<machine::Machine>>;
pub type MachineMap = Arc<ArcSwap<MachineMapLocal>>;
