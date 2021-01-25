use std::collections::HashMap;
use async_graphql::{
    // ID,
    FieldResult,
    Context,
};
use anyhow::{
    anyhow,
    // Result,
    // Context as _,
};
use cgt::SetConfigResponse;
use messages::set_materials::SetMaterialsInput;
use teg_auth::{
    AuthContext,
};
use teg_material::Material;
// use teg_json_store::Record as _;

use crate::{
    config::{
        CombinedConfigView,
        MachineConfig,
    },
    machine::{
        Machine,
        // MachineData,
        messages
    },
};
use super::config_graphql_types as cgt;

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
        let db: &crate::Db = ctx.data()?;
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
                Err(anyhow!("Cannot create users directly. Use an invite instead."))?;
            }
            (AUTH, "invite") => {
                Err(anyhow!("Please use createInvite mutation instead."))?;
            }
            (MATERIAL, _) => {
                Material::create(db, model).await?;
            }
            // Config file persisted types (components, plugins)
            // ----------------------------------------------------------
            (COMPONENT, component_type) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let msg = messages::CreateComponent {
                    component_type: component_type.to_string(),
                    model: model,
                };
                machine.call(msg).await??;
            }
            (PLUGIN, "teg-core") => {
                // let machine = input.machine_id
                //     .map(|id| machines.get(&id))
                //     .ok_or_else(|| anyhow!("Machine ID not found"))?;

                // let plugin_config: CorePluginConfig = serde_json::from_value(*input.model)?;
                // let plugin = Plugin::Core(
                //     PluginContainer::new(plugin_config)
                // );

                // machine.call(messages::CreatePlugin(plugin)).await?
                Err(anyhow!("Cannot create plugins in current implementation."))?;
            }
            _ => {
                Err(anyhow!("Invalid schemaFormKey: {:?}", input.schema_form_key))?;
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
                Err(anyhow!("Please use updateUser mutation instead."))?;
                // let id = id.replacen("user-", "", 1).parse()?;
                // let _ = User::update_from_mutation(
                //     db,
                //     &id,
                //     input.model_version,
                //     model,
                // ).await?;
            }
            (AUTH, id) if id.starts_with("invite-") => {
                Err(anyhow!("Please use updateInvite mutation instead."))?;
                // let id = id.replacen("invite-", "", 1).parse()?;
                // let _ = Invite::update_from_mutation(
                //     db,
                //     &id,
                //     input.model_version,
                //     model,
                // ).await?;
            }
            (MATERIAL, id) if id.starts_with("material-")  => {
                Err(anyhow!("Please use updateMaterial mutation instead."))?;
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
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let msg = messages::UpdateComponent {
                    id: id.to_string(),
                    version: input.model_version,
                    model,
                };
                machine.call(msg).await??;
            }
            (PLUGIN, package) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let msg = messages::UpdatePlugin {
                    package: package.to_string(),
                    version: input.model_version,
                    model,
                };
                machine.call(msg).await??;
            }
            _ => {
                Err(anyhow!("Invalid config_form_id: {:?}", input.config_form_id))?;
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
                Err(anyhow!("Please use deleteUser mutation instead."))?;
                // let id = id.replacen("user-", "", 1).parse()?;
                // User::remove_from_mutation(
                //     db,
                //     &id,
                // ).await?;
            }
            (AUTH, id) if id.starts_with("invite-") => {
                Err(anyhow!("Please use deleteInvite mutation instead."))?;
                // let id = id.replacen("invite-", "", 1).parse()?;
                // Invite::remove(
                //     db,
                //     &id,
                // ).await?;
            }
            (MATERIAL, id) if id.starts_with("material-")  => {
                Err(anyhow!("Please use deleteMaterial mutation instead."))?;
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
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let id = input.config_form_id.into();
                machine.call(messages::RemoveComponent(id)).await??;
            }
            (PLUGIN, _package) => {
                // let machine = input.machine_id
                //     .map(|id| machines.get(&id))
                //     .ok_or_else(|| anyhow!("Machine ID not found"))?;

                // let id = input.config_form_id.into();
                // machine.call(messages::DeletePlugin(id)).await?

                // There is only one "core" plugin at the moment so deletion doesn't makes
                // sense yet.
                Err(anyhow!("Cannot delete plugins in current implementation."))?;
            }
            _ => {
                Err(anyhow!("Invalid config_form_id: {:?}", input.config_form_id))?;
            }
        };

        Ok(None)
    }

    #[instrument(skip(self, ctx))]
    async fn create_machine<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: cgt::CreateMachineInput,
    ) -> FieldResult<SetConfigResponse> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines_store: &crate::MachineMap = ctx.data()?;

        let default_config = include_str!("../../../../../machine.default.toml");
        let mut machine_config: MachineConfig = toml::from_str(default_config)?;

        let machine_id = nanoid!(11);
        machine_config.id = machine_id.clone();

        // Create the Machine by copying fields out of the CombinedConfigView
        let CombinedConfigView {
            // Core Plugin
            name,
            automatic_printing,
            // Controller Component
            serial_port_id,
            automatic_baud_rate_detection,
            baud_rate,
            // Build Platform Component
            heated_build_platform,
        } = (*input.model).clone();

        let core_plugin = machine_config.core_plugin_mut()?;
        core_plugin.model.name = name;
        core_plugin.model.automatic_printing = automatic_printing;

        let controller = machine_config.get_controller_mut();
        controller.model.serial_port_id = serial_port_id;
        controller.model.automatic_baud_rate_detection = automatic_baud_rate_detection;
        controller.model.baud_rate = baud_rate;

        let build_platform = machine_config.build_platforms
            .first_mut()
            .ok_or_else(|| anyhow!("Build Platform not found"))?;

        build_platform.model.heater = heated_build_platform;

        // TODO: Save the config file
        machine_config.save_config().await?;

        // Give the driver 50ms to startup so the first connection attempt is likely to succeed
        // without having to retry.
        use std::time::Duration;
        use async_std::task;
        task::sleep(Duration::from_millis(50)).await;

        // Start the machine actor
        let db_clone = db.clone();
        let machine = Machine::start(db_clone, &machine_id)
            .await?;

        let machine_id = machine_id.clone();
        machines_store.rcu(|machines| {
            let mut machines = HashMap::clone(&machines);
            machines.insert(machine_id.clone().into(), machine.clone());
            machines
        });

        // TODO: Also return the new machine!
        Ok(SetConfigResponse {
            errors: vec![],
        })
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
            .ok_or_else(|| anyhow!("Machine ({:?}) not found", &machine_id))?;

        let msg = messages::set_materials::SetMaterial(input.toolheads);
        machine.call(msg).await??;

        Ok(None)
    }
}
