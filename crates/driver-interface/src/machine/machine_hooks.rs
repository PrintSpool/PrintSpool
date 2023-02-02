use std::pin::Pin;

use eyre::Result;
use futures::Future;

use crate::{config::MachineConfig, plugins::Plugin, task::Task, MachineHooksList};

use super::Machine;

#[async_trait::async_trait]
pub trait MachineHooks {
    async fn before_create<'c>(
        &self,
        tx: sqlx::Transaction<'c, sqlx::Postgres>,
        machine_config: &mut MachineConfig,
    ) -> Result<sqlx::Transaction<'c, sqlx::Postgres>>;

    async fn after_create(&self, machine_id: &crate::DbId) -> Result<()>;

    async fn before_start<'c>(
        &self,
        tx: sqlx::Transaction<'c, sqlx::Postgres>,
        id: &crate::DbId,
    ) -> Result<sqlx::Transaction<'c, sqlx::Postgres>>;

    async fn before_task_settle<'c>(
        &self,
        tx: &mut sqlx::Transaction<'c, sqlx::Postgres>,
        machine_hooks: &MachineHooksList,
        machine_data: &Machine,
        machine_addr: xactor::Addr<Machine>,
        task: &mut Task,
    ) -> Result<Option<Pin<Box<dyn Future<Output = ()> + Send>>>>;

    async fn after_plugin_update(&self, machine_id: &crate::DbId, plugin: &Plugin) -> Result<()>;
}
