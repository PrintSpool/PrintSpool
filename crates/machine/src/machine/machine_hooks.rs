use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{config::MachineConfig, plugins::Plugin, task::Task};

use super::{Machine, MachineData};

#[async_trait::async_trait]
pub trait MachineHooks {
    async fn before_create<'c>(
        &self,
        tx: sqlx::Transaction<'c, sqlx::Sqlite>,
        machine_config: &mut MachineConfig,
    ) -> Result<sqlx::Transaction<'c, sqlx::Sqlite>>;

    async fn after_create(
        &self,
        machine_id: &crate::DbId,
    ) -> Result<()>;

    async fn before_start<'c>(
        &self,
        tx: sqlx::Transaction<'c, sqlx::Sqlite>,
        id: &crate::DbId,
    ) -> Result<sqlx::Transaction<'c, sqlx::Sqlite>>;

    async fn before_task_settle<'c>(
        &self,
        tx: &mut sqlx::Transaction<'c, sqlx::Sqlite>,
        machine_data: &MachineData,
        machine_addr: xactor::Addr<Machine>,
        task: &mut Task,
    ) -> Result<()>;

    async fn after_plugin_update(
        &self,
        machine_id: &crate::DbId,
        plugin: &Plugin,
    ) -> Result<()>;
}
