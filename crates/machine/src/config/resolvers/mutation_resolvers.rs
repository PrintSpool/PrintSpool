use async_graphql::{
    // ID,
    FieldResult,
    Context,
};
use eyre::{
    eyre,
    // Result,
    // Context as _,
};
use cgt::SetConfigResponse;
use messages::set_materials::SetMaterialsInput;
use teg_auth::{
    AuthContext,
};
// use teg_json_store::Record as _;

use super::config_graphql_types as cgt;
use crate::{
    machine::messages,
};

#[derive(Default)]
pub struct ConfigMutation;

#[async_graphql::Object]
impl ConfigMutation {
    #[instrument(skip(self, ctx))]
    async fn create_config<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: cgt::CreateConfigInput,
    ) -> FieldResult<cgt::SetConfigResponse> {
        use cgt::ConfigCollection::*;
        // let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let model = (*input.model).clone();

        match (&input.collection, &input.schema_form_key[..]) {
            // Database persisted types (users, invites, materials)
            // ----------------------------------------------------------
            (AUTH, "user") => {
                // User::create(db, &input.model).await?
                Err(eyre!("Cannot create users directly. Use an invite instead."))?;
            }
            (AUTH, "invite") => {
                Err(eyre!("Please use createInvite mutation instead."))?;
            }
            (MATERIAL, _) => {
                Err(eyre!("Please use createMaterial mutation instead."))?;
            }
            // Config file persisted types (components, plugins)
            // ----------------------------------------------------------
            (COMPONENT, component_type) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| eyre!("Machine ID not found"))?;

                let msg = messages::CreateComponent {
                    component_type: component_type.to_string(),
                    model: model,
                };
                machine.call(msg).await??;
            }
            (PLUGIN, "teg-core") => {
                // let machine = input.machine_id
                //     .map(|id| machines.get(&id))
                //     .ok_or_else(|| eyre!("Machine ID not found"))?;

                // let plugin_config: CorePluginConfig = serde_json::from_value(*input.model)?;
                // let plugin = Plugin::Core(
                //     PluginContainer::new(plugin_config)
                // );

                // machine.call(messages::CreatePlugin(plugin)).await?
                Err(eyre!("Cannot create plugins in current implementation."))?;
            }
            _ => {
                Err(eyre!("Invalid schemaFormKey: {:?}", input.schema_form_key))?;
            }
        };

        let response = SetConfigResponse {
            errors: vec![],
        };
        Ok(response)
    }

    #[instrument(skip(self, ctx))]
    async fn update_config<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: cgt::UpdateConfigInput,
    ) -> FieldResult<cgt::SetConfigResponse> {
        use cgt::ConfigCollection::*;
        // let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let model = (*input.model).clone();

        match (&input.collection, &input.config_form_id) {
            // Database persisted types (users, invites, materials)
            // ----------------------------------------------------------
            (AUTH, id) if id.starts_with("user-") => {
                Err(eyre!("Please use updateUser mutation instead."))?;
                // let id = id.replacen("user-", "", 1).parse()?;
                // let _ = User::update_from_mutation(
                //     db,
                //     &id,
                //     input.model_version,
                //     model,
                // ).await?;
            }
            (AUTH, id) if id.starts_with("invite-") => {
                Err(eyre!("Please use updateInvite mutation instead."))?;
                // let id = id.replacen("invite-", "", 1).parse()?;
                // let _ = Invite::update_from_mutation(
                //     db,
                //     &id,
                //     input.model_version,
                //     model,
                // ).await?;
            }
            (MATERIAL, id) if id.starts_with("material-")  => {
                Err(eyre!("Please use updateMaterial mutation instead."))?;
                // let id = id.replacen("material-", "", 1).parse()?;
                // let _ = Material::update_from_mutation(
                //     db,
                //     &id,
                //     input.model_version,
                //     model,
                // ).await?;
            }
            // Config file persisted types (components, plugins)
            // ----------------------------------------------------------
            (COMPONENT, id) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| eyre!("Machine ID not found"))?;

                let msg = messages::UpdateComponent {
                    id: id.to_string(),
                    version: input.model_version,
                    model,
                };
                machine.call(msg).await??;
            }
            (PLUGIN, plugin_id) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| eyre!("Machine ID not found"))?;

                let msg = messages::UpdatePlugin {
                    plugin_id: plugin_id.to_string(),
                    version: input.model_version,
                    model,
                };
                machine.call(msg).await??;
            }
            _ => {
                Err(eyre!("Invalid config_form_id: {:?}", input.config_form_id))?;
            }
        };

        let response = SetConfigResponse {
            errors: vec![],
        };
        Ok(response)
    }

    #[instrument(skip(self, ctx))]
    async fn delete_config<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: cgt::DeleteConfigInput,
    ) -> FieldResult<Option<bool>> {
        use cgt::ConfigCollection::*;
        // let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        match (&input.collection, &input.config_form_id) {
            // Database persisted types (users, invites, materials)
            // ----------------------------------------------------------
            (AUTH, id) if id.starts_with("user-") => {
                Err(eyre!("Please use deleteUser mutation instead."))?;
                // let id = id.replacen("user-", "", 1).parse()?;
                // User::remove_from_mutation(
                //     db,
                //     &id,
                // ).await?;
            }
            (AUTH, id) if id.starts_with("invite-") => {
                Err(eyre!("Please use deleteInvite mutation instead."))?;
                // let id = id.replacen("invite-", "", 1).parse()?;
                // Invite::remove(
                //     db,
                //     &id,
                // ).await?;
            }
            (MATERIAL, id) if id.starts_with("material-")  => {
                Err(eyre!("Please use deleteMaterial mutation instead."))?;
                // let id = id.replacen("material-", "", 1).parse()?;
                // Material::remove(
                //     db,
                //     &id,
                // ).await?;
            }
            // Config file persisted types (components, plugins)
            // ----------------------------------------------------------
            (COMPONENT, _) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| eyre!("Machine ID not found"))?;

                let id = input.config_form_id.into();
                machine.call(messages::RemoveComponent(id)).await??;
            }
            (PLUGIN, _package) => {
                // let machine = input.machine_id
                //     .map(|id| machines.get(&id))
                //     .ok_or_else(|| eyre!("Machine ID not found"))?;

                // let id = input.config_form_id.into();
                // machine.call(messages::DeletePlugin(id)).await?

                // There is only one "core" plugin at the moment so deletion doesn't makes
                // sense yet.
                Err(eyre!("Cannot delete plugins in current implementation."))?;
            }
            _ => {
                Err(eyre!("Invalid config_form_id: {:?}", input.config_form_id))?;
            }
        };

        Ok(None)
    }

    #[instrument(skip(self, ctx))]
    async fn set_materials<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: SetMaterialsInput,
    ) -> FieldResult<Option<bool>> {
        // use cgt::ConfigCollection::*;
        // let db: &crate::Db = ctx.data()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine_id = input.machine_id;
        let machine = machines.get(&machine_id)
            .ok_or_else(|| eyre!("Machine ({:?}) not found", &machine_id))?;

        let msg = messages::set_materials::SetMaterial(input.toolheads);
        machine.call(msg).await??;

        Ok(None)
    }
}
