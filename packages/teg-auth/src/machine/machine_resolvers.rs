use std::sync::Arc;
use async_graphql::*;

use super::models::{
    Machine,
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
    async fn id(&self) -> &ID { &self.config_id }

    async fn components<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Component>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;
        let config = ctx.machine_config.load();

        Ok(config.components.clone())
    }
}
