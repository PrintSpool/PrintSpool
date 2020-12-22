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
impl MachineUserExt {
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
