use super::Machine;
use crate::{task::Task, Db, DbId};
use eyre::Result;

#[async_trait::async_trait]
pub trait MachineHooks: Send + Sync {
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
        task: &mut Task,
    ) -> Result<()> {
        Ok(())
    }

    async fn after_task_settle<'c>(
        &self,
        db: Db,
        machine: &mut Machine,
        task: &mut Task,
    ) -> Result<()> {
        Ok(())
    }
}
