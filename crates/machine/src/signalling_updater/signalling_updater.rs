use std::{pin::Pin, sync::Arc};
use futures::Future;
use xactor::Actor;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{MachineHooks, MachineHooksList, config::MachineConfig, machine::Machine, machine::MachineData, plugins::Plugin, task::Task};

use super::{MachineSignallingUpdate, MachineUpdateOperation, SyncChanges};

/// Actor to synchronize machine CRUD changes with the signalling server's cached list of each
/// host's machines.
pub struct SignallingUpdater {
    pub db: crate::Db,
    pub server_keys: Arc<teg_auth::ServerKeys>,
}

#[async_trait::async_trait]
impl Actor for SignallingUpdater {
    #[instrument(skip(self, ctx))]
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()> {
        let result = ctx.address().send(SyncChanges);

        if let Err(err) = result {
            warn!("Error starting signalling sync: {:?}", err);
            // Prevent a tight loop of actor restarts from DOSing the server
            async_std::task::sleep(std::time::Duration::from_secs(1)).await;
            ctx.stop(Some(err));
        }

        Ok(())
    }
}

impl SignallingUpdater {
    pub async fn start(
        db: crate::Db,
        server_keys: Arc<teg_auth::ServerKeys>,
    ) -> Result<xactor::Addr<SignallingUpdater>> {
        let signalling_updater = xactor::Supervisor::start(move ||
            SignallingUpdater {
                db: db.clone(),
                server_keys: server_keys.clone(),
            }
        ).await?;
        Ok(signalling_updater)
    }
}

pub struct SignallingUpdaterMachineHooks {
    pub db: crate::Db,
    pub signalling_updater: xactor::Addr<SignallingUpdater>,
}

#[async_trait::async_trait]
impl MachineHooks for SignallingUpdaterMachineHooks {
    async fn before_create<'c>(
        &self,
        tx: sqlx::Transaction<'c, sqlx::Postgres>,
        machine_config: &mut MachineConfig,
    ) -> Result<sqlx::Transaction<'c, sqlx::Postgres>> {
        let name = machine_config.core_plugin()?.model.name.clone();
        let operation = MachineUpdateOperation::Register { name };

        let (tx, _) = MachineSignallingUpdate::create(
            tx,
            machine_config.id.clone(),
            operation,
        ).await?;

        Ok(tx)
    }

    async fn after_create(
        &self,
        _machine_id: &crate::DbId,
    ) -> Result<()> {
        self.signalling_updater.send(SyncChanges)?;
        Ok(())
    }

    async fn before_start<'c>(
        &self,
        tx: sqlx::Transaction<'c, sqlx::Postgres>,
        _id: &crate::DbId,
    ) -> Result<sqlx::Transaction<'c, sqlx::Postgres>> {
        Ok(tx)
    }

    // Handle machine name changes
    async fn after_plugin_update(
        &self,
        machine_id: &crate::DbId,
        plugin: &Plugin,
    ) -> Result<()> {
        let Plugin::Core(core_plugin) = plugin;

        let name = core_plugin.model.name.clone();
        let operation = MachineUpdateOperation::Register { name };

        let tx = self.db.begin().await?;

        let (tx, _) = MachineSignallingUpdate::create(
            tx,
            machine_id.clone(),
            operation,
        ).await?;

        tx.commit().await?;
        self.signalling_updater.send(SyncChanges)?;

        Ok(())
    }

    async fn before_task_settle<'c>(
        &self,
        _tx: &mut sqlx::Transaction<'c, sqlx::Postgres>,
        _machine_hooks: &MachineHooksList,
        _machine_data: &MachineData,
        _machine_addr: xactor::Addr<Machine>,
        _task: &mut Task,
    ) -> Result<Option<Pin<Box<dyn Future<Output = ()> + Send>>>> {
        Ok(None)
    }
}
