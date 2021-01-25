use async_graphql::{
    ID,
    FieldResult,
    Context,
};
use anyhow::{
    anyhow,
    // Result,
    Context as _,
};
use teg_auth::{
    AuthContext,
};
use teg_json_store::Record;

use crate::machine::{
    MachineViewer,
    messages,
};

#[derive(Default)]
pub struct MachineMutation;

#[async_graphql::Object]
impl MachineMutation {
    #[instrument(skip(self, ctx))]
    async fn e_stop<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: ID,
    ) -> FieldResult<Option<bool>> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&id)
            .ok_or_else(|| anyhow!("Machine #{:?} not found", id))?;

        machine.call(messages::StopMachine).await?;

        Ok(None)
    }

    #[instrument(skip(self, ctx))]
    async fn reset<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        id: ID,
    ) -> FieldResult<Option<bool>> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&id)
            .ok_or_else(|| anyhow!("Machine #{:?} not found", id))?;

        machine.call(messages::ResetMachine).await?;

        Ok(None)
    }

    #[instrument(skip(self, ctx))]
    async fn continue_viewing_machine<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        #[graphql(name="machineID")]
        machine_id: ID,
    ) -> FieldResult<Option<bool>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        let user = auth.require_authorized_user()?;

        let machine_id = machine_id.parse::<crate::DbId>()
            .with_context(|| format!("Invalid machine id: {:?}", machine_id))?;

        let viewer: Option<MachineViewer> = sqlx::query!(
            r#"
                SELECT props FROM machine_viewers
                WHERE
                    machine_id = ? AND
                    user_id = ?
            "#,
            machine_id,
            user.id,
        )
            .fetch_optional(db)
            .await?
            .map(|row| serde_json::from_str(&row.props))
            .transpose()?;

        if let Some(mut viewer) = viewer {
            // Renew a pre-existing viewer
            viewer.continue_viewing(db).await?;
        } else {
            // Add a new viewer
            let viewer = MachineViewer::new(
                machine_id,
                user.id.clone(),
            );
            viewer.insert(db).await?;
        };

        Ok(None)
    }
}
