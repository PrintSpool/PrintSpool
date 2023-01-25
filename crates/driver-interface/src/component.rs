use chrono::{DateTime, Utc};
use derive_more::{Deref, DerefMut};
use schemars::schema::Schema;
use serde::{Deserialize, Serialize};
use validator::Validate;

use crate::{capability::Capability, driver::Driver};

mod serialization;

#[derive(Serialize, Deserialize)]
pub struct Component {
    pub id: crate::DbId,
    pub created_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,

    pub driver_data: DynDriverComponent,
}

#[derive(Deref, DerefMut)]
pub struct DynDriverComponent(Box<dyn DriverComponent>);

#[dyn_clonable::clonable]
pub trait DriverComponent: Clone + std::fmt::Debug + erased_serde::Serialize + Validate {
    fn driver(&self) -> &'static dyn Driver;
    // fn driver_name(&self) -> &'static str;
    // fn json_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> Schema;
    fn capabilities(&self) -> Vec<Capability>;
}
