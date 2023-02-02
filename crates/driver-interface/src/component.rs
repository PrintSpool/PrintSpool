use std::any::Any;

use crate::{capability::Capability, driver::Driver, machine::Machine, DbId, Deletion};
use bonsaidb::core::{define_basic_mapped_view, document::CollectionDocument, schema::Collection};
use chrono::{DateTime, Utc};
use derive_more::{Deref, DerefMut};
use derive_new::new;
use serde::{Deserialize, Serialize};
use validator::Validate;

pub mod config;
mod serialization;
mod type_descriptor;

pub use type_descriptor::ComponentTypeDescriptor;

#[derive(Debug, Serialize, Deserialize, Collection, Clone, new)]
#[collection(name = "components", views = [], natural_id = |c: Component| Some(c.id))]
pub struct Component {
    #[new(default = defaultDbId)]
    pub id: DbId<Self>,
    #[new(value = "Utc::now()")]
    pub created_at: DateTime<Utc>,
    #[new(default)]
    pub deleted_at: Option<DateTime<Utc>>,

    // Foreign keys
    pub machine_id: DbId<Machine>,

    pub driver_config: DynDriverComponent,
}

define_basic_mapped_view!(
    ComponentsByMachine,
    Component,
    0,
    "by-machine",
    (Deletion, DbId<Machine>, DbId<Component>),
    |document: CollectionDocument<Component>| {
        let c = document.contents;
        document
            .header
            .emit_key((c.deleted_at.into(), c.machine_id, c.id))
    }
);

define_basic_mapped_view!(
    ComponentsByType,
    Component,
    0,
    "by-type",
    (Deletion, DbId<Machine>, String),
    |document: CollectionDocument<Component>| {
        let c = document.contents;
        document.header.emit_key((
            c.deleted_at.into(),
            c.machine_id,
            c.driver_config.type_descriptor().name,
        ))
    }
);

#[derive(Deref, DerefMut)]
pub struct DynDriverComponent(Box<dyn DriverComponent>);

#[dyn_clonable::clonable]
pub trait DriverComponent:
    Clone + std::fmt::Debug + erased_serde::Serialize + Validate + Any
{
    fn driver(&self) -> &'static dyn Driver;
    // fn driver_name(&self) -> &'static str;
    // fn json_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> Schema;
    fn capabilities(&self) -> Vec<Capability>;

    fn type_descriptor(&self) -> ComponentTypeDescriptor;
}
