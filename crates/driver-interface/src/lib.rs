pub use db_id::DbId;
pub use deletion::Deletion;
pub use erased_serde;
pub use serde_json;

use dashmap::DashMap;
use driver_instance::LocalDriverInstance;
use machine::Machine;
use std::pin::Pin;

pub mod capability;
pub mod component;
mod db_id;
mod deletion;
pub mod driver;
pub mod driver_instance;
pub mod machine;
pub mod material;
pub mod task;

pub type Db = bonsaidb::AnyDatabase;
pub type BoxedDriverInstance = Box<Pin<dyn LocalDriverInstance>>;
pub type DriverMapInstance = DashMap<DbId<Machine>, BoxedDriverInstance>;
