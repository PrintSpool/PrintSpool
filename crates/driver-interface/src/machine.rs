use chrono::{DateTime, Utc};
use derive_more::{Deref, DerefMut};
use schemars::schema::Schema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::{capability::Capability, component::DriverComponent, driver::Driver};

mod serialization;

#[derive(Serialize, Deserialize)]
pub struct Machine {
    pub id: crate::DbId,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,

    pub driver_data: DynDriverMachine,
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
