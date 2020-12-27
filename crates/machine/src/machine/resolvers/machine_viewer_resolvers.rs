// use std::sync::Arc;
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use std::collections::VecDeque;
use teg_config_form::ConfigForm;

use crate::machine::{
    MachineData,
    models::MachineStatusGQL,
    models::MachineStatus,
};
use crate::components::{
    Component
};
use crate::machine::models::GCodeHistoryEntry;
use super::machine_error_resolvers::MachineError;
use super::MachineViewer;

#[async_graphql::Object]
impl MachineViewer {
    async fn id(&self) -> ID { self.config.id.into() }

}
