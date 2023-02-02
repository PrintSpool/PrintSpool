use async_graphql::{Context, FieldResult, ID};
use eyre::{
    eyre,
    // Result,
    Context as _,
};
use printspool_auth::AuthContext;
use printspool_common::Void;
use printspool_json_store::{JsonRow, Record as _};
use std::collections::HashMap;

use crate::machine::{
    messages::{self, GetData},
    MachineViewer,
};

// use printspool_json_store::Record as _;

use crate::{
    config::{CombinedConfigView, MachineConfig},
    machine::{Machine, Machine},
};

#[derive(async_graphql::InputObject, Debug)]
pub struct CreateMachineInput {
    pub model: async_graphql::Json<CombinedConfigView>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct UpdateMachineInput {
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    pub model_version: i32,
    pub model: async_graphql::Json<serde_json::Value>,
}

#[derive(Default)]
pub struct MachineMutation;

#[async_graphql::Object]
impl MachineMutation {
    #[instrument(skip(self, ctx))]
    async fn stop<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(name = "machineID")] machine_id: ID,
    ) -> FieldResult<Machine> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines
            .get(&machine_id)
            .ok_or_else(|| eyre!("Machine #{:?} not found", machine_id))?;

        machine.call(messages::StopMachine).await?;

        let machine_data = machine.call(messages::GetData).await??;

        Ok(machine_data)
    }

    #[instrument(skip(self, ctx))]
    async fn reset<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(name = "machineID")] machine_id: ID,
    ) -> FieldResult<Machine> {
        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines
            .get(&machine_id)
            .ok_or_else(|| eyre!("Machine #{:?} not found", machine_id))?;

        machine.call(messages::ResetMachine).await?;
        let machine_data = machine.call(messages::GetData).await??;

        Ok(machine_data)
    }

    #[instrument(skip(self, ctx))]
    async fn continue_viewing_machine<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        #[graphql(name = "machineID")] machine_id: ID,
    ) -> FieldResult<Option<printspool_common::Void>> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        let user = auth.require_authorized_user()?;

        let machine_id = machine_id
            .parse::<crate::DbId>()
            .with_context(|| format!("Invalid machine id: {:?}", machine_id))?;

        let viewer: Option<MachineViewer> = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM machine_viewers
                WHERE
                    machine_id = $1 AND
                    user_id = $2
            "#,
            machine_id,
            user.id,
        )
        .fetch_optional(db)
        .await?
        .map(|row| MachineViewer::from_row(row))
        .transpose()?;

        if let Some(mut viewer) = viewer {
            // Renew a pre-existing viewer
            viewer.continue_viewing(db).await?;
        } else {
            // Add a new viewer
            let viewer = MachineViewer::new(machine_id, user.id.clone());
            viewer.insert(db).await?;
        };

        Ok(None)
    }

    #[instrument(skip(self, ctx))]
    async fn create_machine<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: CreateMachineInput,
    ) -> FieldResult<Machine> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;
        let machines_store: &crate::MachineMap = ctx.data()?;
        let machine_hooks: &crate::MachineHooksList = ctx.data()?;

        async move {
            // dbg!(&input.model);
            auth.authorize_admins_only()?;

            let default_config = include_str!("../../../../../machine.default.toml");
            let mut machine_config: MachineConfig =
                toml::from_str(default_config).map_err(|err| {
                    eyre!(
                        "Error in default config. Please report this bug to the developers: {:?}",
                        err
                    )
                })?;

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

            let build_platform = machine_config
                .build_platforms
                .first_mut()
                .ok_or_else(|| eyre!("Build Platform not found"))?;

            build_platform.model.heater = heated_build_platform;

            // Run before_create hooks in a transaction around saving the config file
            let mut tx = db.begin().await?;

            for hooks_provider in machine_hooks.iter() {
                tx = hooks_provider
                    .before_create(tx, &mut machine_config)
                    .await?;
            }

            // Save the config file
            machine_config.save_config().await?;

            // Commit the transaction
            tx.commit().await?;

            // Give the driver 50ms to startup so the first connection attempt is likely to succeed
            // without having to retry.
            use async_std::task;
            use std::time::Duration;
            task::sleep(Duration::from_millis(50)).await;

            // Start the machine actor
            let db_clone = db.clone();
            let machine = Machine::start(db_clone, machine_hooks.clone(), &machine_id).await?;

            let machine_id = machine_id.clone();
            machines_store.rcu(|machines| {
                let mut machines = HashMap::clone(&machines);
                machines.insert(machine_id.clone().into(), machine.clone());
                machines
            });

            for hooks_provider in machine_hooks.iter() {
                hooks_provider.after_create(&machine_id).await?;
            }

            // return the new machine!
            let machine_data: Machine = machine.call(GetData).await??;
            eyre::Result::<_>::Ok(machine_data)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }

    #[instrument(skip(self, ctx))]
    async fn update_machine<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: UpdateMachineInput,
    ) -> FieldResult<Machine> {
        let auth: &AuthContext = ctx.data()?;

        auth.require_authorized_user()?;

        let machines: &crate::MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            let machine = machines
                .get(&input.machine_id)
                .ok_or_else(|| eyre!("Machine ID not found"))?;

            let msg = messages::UpdatePlugin {
                plugin_id: "teg-core".to_string(),
                version: input.model_version,
                model: input.model.0,
            };
            machine.call(msg).await??;

            let machine_data: Machine = machine.call(GetData).await??;
            eyre::Result::<_>::Ok(machine_data)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }

    #[instrument(skip(self, ctx))]
    async fn delete_machine<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(name = "machineID")] machine_id: ID,
    ) -> FieldResult<Option<Void>> {
        let auth: &AuthContext = ctx.data()?;

        auth.require_authorized_user()?;

        let machines_store: &crate::MachineMap = ctx.data()?;
        let machines = machines_store.load();

        async move {
            let machine = machines
                .get(&machine_id)
                .ok_or_else(|| eyre!("Machine ID not found"))?;

            machine.call(messages::DeleteMachine).await??;

            machines_store.rcu(|machines| {
                let mut machines = HashMap::clone(&machines);
                machines.remove(&machine_id);
                machines
            });

            eyre::Result::<_>::Ok(None)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
