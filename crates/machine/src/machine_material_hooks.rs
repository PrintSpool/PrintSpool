use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_material::MaterialHooks;
use crate::machine::messages::ResetMaterialTargets;

pub struct MachineMaterialHooks {
    pub machines: crate::MachineMap,
}

#[async_trait::async_trait]
impl MaterialHooks for MachineMaterialHooks {
    async fn after_update<'c>(
        &self,
        id: &crate::DbId,
    ) -> Result<()> {
        let machines = self.machines.load();

        for machine in machines.values() {
            let msg = ResetMaterialTargets {
                material_id_filter: Some(id.clone())
            };
            machine.call(msg).await??;
        }

        Ok(())
    }
}
