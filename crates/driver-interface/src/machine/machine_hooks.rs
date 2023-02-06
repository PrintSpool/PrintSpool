use super::Machine;
use crate::{task::Task, Db, DbId};
use eyre::Result;

#[async_trait::async_trait]
pub trait MachineHooks: Send + Sync {
    async fn before_create<'c>(
        &self,
        #[allow(unused)] db: &Db,
        #[allow(unused)] machine: &mut Machine,
    ) -> Result<()> {
        Ok(())
    }

    async fn after_create(&self, #[allow(unused)] machine: &Machine) -> Result<()> {
        Ok(())
    }

    async fn before_start<'c>(
        &self,
        #[allow(unused)] db: &Db,
        #[allow(unused)] id: &DbId<Machine>,
    ) -> Result<()> {
        Ok(())
    }

    async fn before_task_settle<'c>(
        &self,
        #[allow(unused)] db: &Db,
        #[allow(unused)] machine: &mut Machine,
        #[allow(unused)] task: &mut Task,
    ) -> Result<()> {
        Ok(())
    }

    async fn after_task_settle<'c>(
        &self,
        #[allow(unused)] db: &Db,
        #[allow(unused)] machine: &mut Machine,
        #[allow(unused)] task: &mut Task,
    ) -> Result<()> {
        Ok(())
    }
}
