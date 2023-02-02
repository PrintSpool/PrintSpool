pub use db_id::DbId;
pub use deletion::Deletion;
pub use erased_serde;
pub use serde_json;

use dashmap::DashMap;
use driver::Driver;
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
pub type BoxedDriver = Box<Pin<dyn Driver>>;
pub type DriverMap = DashMap<DbId<Machine>, BoxedDriver>;
