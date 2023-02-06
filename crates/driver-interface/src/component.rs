pub mod config;
mod serialization;
mod type_descriptor;

pub use type_descriptor::ComponentTypeDescriptor;

use crate::{capability::Capability, driver::Driver, machine::Machine, DbId, Deletion};
use bonsaidb::core::{
    define_basic_mapped_view,
    document::{CollectionDocument, Emit},
};
use derive_more::{Deref, DerefMut};
use printspool_proc_macros::printspool_collection;
use std::any::Any;
use validator::Validate;

#[printspool_collection]
pub struct Component {
    // Foreign keys
    #[printspool(foreign_key)]
    pub machine_id: DbId<Machine>,

    pub driver_config: DynDriverComponent,
}

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
            c.driver_config.type_descriptor().name.into(),
        ))
    }
);

#[derive(Debug, Deref, DerefMut, Clone)]
pub struct DynDriverComponent(Box<dyn DriverComponent>);

#[dyn_clonable::clonable]
pub trait DriverComponent:
    Clone + Sync + Send + std::fmt::Debug + erased_serde::Serialize + Validate + Any
{
    fn driver(&self) -> &'static dyn Driver;
    // fn driver_name(&self) -> &'static str;
    // fn json_schema(&self, gen: &mut schemars::gen::SchemaGenerator) -> Schema;
    fn capabilities(&self) -> Vec<Capability>;

    fn type_descriptor(&self) -> ComponentTypeDescriptor;
}
