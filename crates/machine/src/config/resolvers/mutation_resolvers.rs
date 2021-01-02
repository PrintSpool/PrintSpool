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
use teg_user::{
    AuthContext,
    user::User,
    invite::Invite,
};
use teg_material::Material;

use crate::{
    components::{
        Component,
        Controller,
        ControllerConfig,
        SpeedController,
        SpeedControllerConfig,
        Toolhead,
        ToolheadConfig,
        Video,
        VideoConfig
    },
    config::{
        CombinedConfigView,
        MachineConfig,
    },
    machine::{
        Machine,
        // MachineData,
        messages
    },
        plugins::{
        Plugin,
        PluginContainer,
        core::CorePluginConfig,
    }};
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

        let response = match (&input.collection, &input.schema_form_key[..]) {
            // Database persisted types (users, invites, materials)
            // ----------------------------------------------------------
            (AUTH, "user") => {
                User::create(db, &input.model).await?
            }
            (AUTH, "invite") => {
                Invite::create(db, &input.model).await?
            }
            (MATERIAL, _) => {
                Material::create(db, &input.model).await?
            }
            // Config file persisted types (components, plugins)
            // ----------------------------------------------------------
            (COMPONENT, component_type) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let component: Component = match component_type {
                    "CONTROLLER" => {
                        let config: ControllerConfig = serde_json::from_value(*input.model)?;
                        Component::Controller(Controller::new(config))
                    },
                    "TOOLHEAD" => {
                        let config: ToolheadConfig = serde_json::from_value(*input.model)?;
                        Component::Toolhead(Toolhead::new(config))
                    },
                    "SPEED_CONTROLLER" => {
                        let config: SpeedControllerConfig = serde_json::from_value(*input.model)?;
                        Component::SpeedController(SpeedController::new(config))
                    },
                    "VIDEO" => {
                        let config: VideoConfig = serde_json::from_value(*input.model)?;
                        Component::Video(Video::new(config))
                    },
                };

                machine.call(messages::CreateComponent(component)).await?
            }
            (PLUGIN, "teg-core") => {
                let machine = input.machine_id
                    .map(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let plugin_config: CorePluginConfig = serde_json::from_value(*input.model)?;
                let plugin = Plugin::Core(
                    PluginContainer::new(plugin_config)
                );

                machine.call(messages::CreatePlugin(plugin)).await?
            }
            _ => {
                Err(anyhow!("Invalid schemaFormKey: {:?}", input.schema_form_key))?;
            }
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
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let response = match (&input.collection, &input.config_form_id) {
            // Database persisted types (users, invites, materials)
            // ----------------------------------------------------------
            (AUTH, id) if id.starts_with("user-") => {
                User::update_from_mutation(
                    db,
                    id.replacen("user-", "", 1).parse()?,
                    &input.model_version,
                    &input.model,
                ).await?
            }
            (AUTH, id) if id.starts_with("invite-") => {
                Invite::update_from_mutation(
                    db,
                    id.replacen("invite-", "", 1).parse()?,
                    &input.model_version,
                    &input.model,
                ).await?
            }
            (MATERIAL, id) if id.starts_with("material-")  => {
                Material::update_from_mutation(
                    db,
                    id.replacen("material-", "", 1).parse()?,
                    &input.model_version,
                    &input.model,
                ).await?
            }
            // Config file persisted types (components, plugins)
            // ----------------------------------------------------------
            (COMPONENT, _) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                // let component: Component = match &component_type[..] {
                //     "CONTROLLER" => {
                //         let config: ControllerConfig = serde_json::from_value(*input.model)?;
                //         Component::Controller(Controller::new(config))
                //     },
                //     "TOOLHEAD" => {
                //         let config: ToolheadConfig = serde_json::from_value(*input.model)?;
                //         Component::Toolhead(Toolhead::new(config))
                //     },
                //     "SPEED_CONTROLLER" => {
                //         let config: SpeedControllerConfig = serde_json::from_value(*input.model)?;
                //         Component::SpeedController(SpeedController::new(config))
                //     },
                //     "VIDEO" => {
                //         let config: VideoConfig = serde_json::from_value(*input.model)?;
                //         Component::Video(Video::new(config))
                //     },
                // };

                let id = input.config_form_id.into();
                machine.call(messages::UpdateComponent(
                    id,
                    input.model_version,
                    input.model,
                )).await?
            }
            (PLUGIN, _) => {
                let machine = input.machine_id
                    .map(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let plugin_config: CorePluginConfig = serde_json::from_value(*input.model)?;
                let plugin = Plugin::Core(
                    PluginContainer::new(plugin_config)
                );

                let id = input.config_form_id.into();
                machine.call(messages::UpdatePlugin(
                    id,
                    input.model_version,
                    input.model,
                )).await?
            }
            _ => {
                Err(anyhow!("Invalid config_form_id: {:?}", input.config_form_id))?;
            }
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
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        auth.authorize_admins_only()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let response = match (&input.collection, &input.config_form_id) {
            // Database persisted types (users, invites, materials)
            // ----------------------------------------------------------
            (AUTH, id) if id.starts_with("user-") => {
                // TODO: check if this is the last admin in this function
                User::remove_from_mutation(
                    db,
                    id.replacen("user-", "", 1).parse()?,
                ).await?
            }
            (AUTH, id) if id.starts_with("invite-") => {
                Invite::remove(
                    db,
                    id.replacen("invite-", "", 1).parse()?,
                ).await?
            }
            (MATERIAL, id) if id.starts_with("material-")  => {
                Material::remove(
                    db,
                    id.replacen("material-", "", 1).parse()?,
                ).await?
            }
            // Config file persisted types (components, plugins)
            // ----------------------------------------------------------
            (COMPONENT, _) => {
                let machine = input.machine_id
                    .and_then(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let id = input.config_form_id.into();
                machine.call(messages::DeleteComponent(id)).await?
            }
            (PLUGIN, _) => {
                let machine = input.machine_id
                    .map(|id| machines.get(&id))
                    .ok_or_else(|| anyhow!("Machine ID not found"))?;

                let id = input.config_form_id.into();
                machine.call(messages::DeletePlugin(id)).await?
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

        // Icrement machine IDs in the host_globals table
        let host_globals = sqlx::query!("SELECT next_machine_id, version FROM host_globals")
            .fetch_one(db)
            .await?;

        let machine_id = host_globals.next_machine_id as crate::DbId;

        sqlx::query!(
            r#"
                UPDATE host_globals
                SET
                    next_machine_id=? + 1,
                    version=? + 1
                WHERE version=?
            "#,
            host_globals.next_machine_id,
            host_globals.version,
            host_globals.version,
        )
            .fetch_one(db)
            .await?;

        machine_config.id = machine_id;

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
        let machine = xactor::Supervisor::start(move ||
            Machine {
                db: db_clone.clone(),
                id: machine_id,
                write_stream: None,
                unix_socket: None,
                data: None,
                attempting_to_connect: false,
            }
        ).await?;

        machines_store.rcu(|machines| {
            let mut machines = HashMap::clone(&machines);
            machines.insert(machine_id.into(), machine.clone());
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
        let db: &crate::Db = ctx.data()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine_id: crate::DbId = input.machine_id.parse()?;
        let machine = machines.get(&machine_id.into())
            .ok_or_else(|| anyhow!("Machine ID {} not found", machine_id))?;

        let msg = messages::set_materials::SetMaterial(input.toolheads);
        machine.call(msg).await?;

        Ok(None)
    }
}
