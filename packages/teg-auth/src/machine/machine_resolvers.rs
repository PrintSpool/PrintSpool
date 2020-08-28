use std::sync::Arc;
use async_graphql::*;

use super::models::{
    Machine,
    MachineStatusGQL,
};

use crate::configuration::{
    Component
};

// use crate::models::{
//     VersionedModel,
//     // VersionedModelError,
// };

/// A spooled set of gcodes to be executed by the machine
#[Object]
impl Machine {
    // TODO: temporary workaround to id cache colission with nodeJS resolver responses
    async fn id(&self) -> ID { format!("rust-{:?}", &self.config_id).into() }
    async fn status(&self) -> MachineStatusGQL { self.status.clone().into() }

    async fn name<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<String> {
        let ctx: &Arc<crate::Context> = ctx.data()?;
        let config = ctx.machine_config.load();

        Ok(config.name()?)
    }

    async fn components<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Component>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;
        let config = ctx.machine_config.load();

        Ok(config.components.clone())
    }
}
