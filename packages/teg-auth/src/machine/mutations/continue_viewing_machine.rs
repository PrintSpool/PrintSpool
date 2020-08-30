use std::sync::Arc;
use async_graphql::{
    ID,
    Object,
    FieldResult,
};
use anyhow::{
    anyhow,
    // Result,
    Context as _,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
    // VersionedModelResult,
};
use crate::machine::models::{
    Machine,
    MachineViewer,
};

#[derive(Default)]
pub struct ContinueViewingMachineMutation;

#[Object]
impl ContinueViewingMachineMutation {
    async fn continue_viewing_machine<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        #[arg(name="machineID")]
        machine_id: ID,
    ) -> FieldResult<Option<bool>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let user_id = ctx.current_user
            .as_ref()
            .ok_or_else(|| anyhow!("Missing user id"))?
            .id;

        let session_id = ctx.session_id
            .as_ref()
            .ok_or_else(|| anyhow!("Missing sesion id"))?;

        let machine_id = machine_id.parse::<u64>()
            .with_context(|| format!("Invalid machine id: {:?}", machine_id))?;

        Machine::get_and_update(&ctx.db, machine_id, |mut machine| {
            let session_id = session_id.clone();
            let viewer = machine.viewers
                .iter_mut()
                .find(|viewer| {
                    viewer.user_id == user_id
                    && viewer.session_id == session_id
                });

            if let Some(viewer) = viewer {
                // Renew a pre-existing viewer
                viewer.continue_viewing();
            } else {
                // Add a new viewer
                let viewer = MachineViewer::new(
                    user_id,
                    session_id,
                );
                machine.viewers.push(viewer);
                machine.viewers.sort_by_key(|viewer| viewer.user_id);
            };

            // Drop expired viewers while we're modifying the db entry
            machine.viewers.retain(|viewer| !viewer.is_expired());

            machine
        })?;

        Ok(None)
    }
}
