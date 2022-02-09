use async_graphql::{
    ID,
    FieldResult,
    Context,
};
use eyre::{
    eyre,
    // Result,
    // Context as _,
};
use printspool_auth::{
    AuthContext,
};
// use printspool_json_store::Record as _;

use crate::{components::ComponentTypeGQL, machine::messages};

#[derive(async_graphql::InputObject, Debug)]
pub struct CreateComponentInput {
    /// eg. \`"CONTROLLER"\`
    pub component_type: ComponentTypeGQL,
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    pub model: async_graphql::Json<serde_json::Value>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct UpdateComponentInput {
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    #[graphql(name = "componentID")]
    pub component_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<serde_json::Value>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct DeleteComponentInput {
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    #[graphql(name = "componentID")]
    pub component_id: ID,
}

#[derive(Default)]
pub struct ComponentMutation;

#[async_graphql::Object]
impl ComponentMutation {
    #[instrument(skip(self, ctx))]
    async fn create_component<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: CreateComponentInput,
    ) -> FieldResult<printspool_common::Void> {
        // let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&input.machine_id)
            .ok_or_else(|| eyre!("Machine ID not found"))?;

        let msg = messages::CreateComponent {
            component_type: input.component_type,
            model: input.model.0,
        };
        machine.call(msg).await??;

        Ok(printspool_common::Void)
    }

    #[instrument(skip(self, ctx))]
    async fn update_component<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: UpdateComponentInput,
    ) -> FieldResult<printspool_common::Void> {
        // let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            auth.authorize_admins_only()?;

            let machine = machines.get(&input.machine_id)
                .ok_or_else(|| eyre!("Machine ID not found"))?;

            let msg = messages::UpdateComponent {
                id: input.component_id.to_string(),
                version: input.model_version,
                model: input.model.0,
            };
            machine.call(msg).await??;

            eyre::Result::<_>::Ok(())
        }
            // log the backtrace which is otherwise lost by FieldResult
            .await
            .map_err(|err| {
                warn!("{:?}", err);
                err
            })?;

        Ok(printspool_common::Void)
    }

    #[instrument(skip(self, ctx))]
    async fn delete_component<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: DeleteComponentInput,
    ) -> FieldResult<Option<printspool_common::Void>> {
        // let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&input.machine_id)
            .ok_or_else(|| eyre!("Machine ID not found"))?;

        let id = input.component_id.into();
        machine.call(messages::RemoveComponent(id)).await??;

        Ok(None)
    }
}
