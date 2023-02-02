use super::Machine;
use super::MachineHooksList;
use crate::{task::Task, Db, DbId};
use eyre::Result;

#[async_trait::async_trait]
pub trait MachineHooks: Clone + Copy + Send + Sync {
    async fn before_create<'c>(&self, db: Db, machine: &mut Machine) -> Result<()> {
        Ok(())
    }

    async fn after_create(&self, machine: &Machine) -> Result<()> {
        Ok(())
    }

    async fn before_start<'c>(&self, db: Db, id: &DbId<Machine>) -> Result<()> {
        Ok(())
    }

    async fn before_task_settle<'c>(
        &self,
        db: Db,
        machine: &mut Machine,
        machine_hooks: &MachineHooksList,
        task: &mut Task,
    ) -> Result<()> {
        Ok(())
    }

    async fn after_task_settle<'c>(
        &self,
        db: Db,
        machine: &mut Machine,
        machine_hooks: &MachineHooksList,
        task: &mut Task,
    ) -> Result<()> {
        Ok(())
    }
}
