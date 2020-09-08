use std::sync::Arc;
use async_graphql::{
    Object,
    ID,
    Context,
    FieldResult,
};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::models::{
    Machine,
    MachineStatusGQL,
};

use crate::models::User;

use crate::configuration::{
    Component
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};

/// A spooled set of gcodes to be executed by the machine
#[Object]
impl Machine {
    // TODO: temporary workaround to id cache colission with nodeJS resolver responses
    async fn id(&self) -> ID { format!("rust-{:?}", &self.config_id).into() }
    async fn status(&self) -> MachineStatusGQL { self.status.clone().into() }
    async fn paused(&self) -> bool { self.pausing_task_id.is_some() }

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

    #[field(name = "viewers")]
    async fn viewers_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<User>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let mut viewers = self.viewers
            .iter()
            .filter(|viewer| !viewer.is_expired())
            .collect::<Vec<_>>();

        viewers.sort_by_key(|viewer| viewer.user_id);
        viewers.dedup_by_key(|viewer| viewer.user_id);

        let users = viewers
            .into_iter()
            .map(|viewer| {
                let user = User::get(&ctx.db, viewer.user_id)?;
                Ok(user)
            })
            .collect::<Result<Vec<User>>>()?;

        Ok(users)
    }
}
