use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{machine::Machine};

#[xactor::message(result = "Result<()>")]
pub struct ResetMaterialTargets {
    /// Optional filter to only update the given material_id (if None: reset all materials)
    pub material_id_filter: Option<crate::DbId>
}

#[async_trait::async_trait]
impl xactor::Handler<ResetMaterialTargets> for Machine {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, msg: ResetMaterialTargets) -> Result<()> {
        self.reset_material_targets(msg).await?;
        Ok(())
    }
}
