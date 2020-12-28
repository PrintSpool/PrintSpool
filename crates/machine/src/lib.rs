// #![feature(proc_macro)]
// extern crate proc_macro;
// #[macro_use] extern crate async_std;
#[macro_use] extern crate tracing;
// #[macro_use] extern crate log_derive;
#[macro_use] extern crate derive_new;
#[macro_use] extern crate smart_default;
// extern crate secp256k1;
// extern crate rand;
// extern crate rmp_serde as rmps;
// extern crate serde;
// extern crate url;
// extern crate gravatar;

use arc_swap::ArcSwap;
use std::collections::HashMap;

pub mod components;
pub mod config;
pub mod machine;
pub mod plugins;
pub mod task;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = i32;

/// GraphQL Context containing all the machine xactor addresses for message passing.
pub type MachineMap = ArcSwap<HashMap<async_graphql::ID, xactor::Addr<machine::Machine>>>;
