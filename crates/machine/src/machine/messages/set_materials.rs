use eyre::{
    eyre,
    Result,
    // Context as _,
};
use async_graphql::{
    ID,
};

use crate::{components::Toolhead, machine::Machine};

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsInput {
    #[graphql(name = "machineID")]
    pub machine_id: ID,
    pub toolheads: Vec<SetMaterialsToolhead>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsToolhead {
    pub id: ID,
    #[graphql(name = "materialID")]
    pub material_id: Option<ID>,
}

#[xactor::message(result = "Result<()>")]
pub struct SetMaterial(pub Vec<SetMaterialsToolhead>);

#[async_trait::async_trait]
impl xactor::Handler<SetMaterial> for Machine {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, msg: SetMaterial) -> Result<()> {
        let db = self.db.clone();
        let data = self.get_data()?;

        if data.status.is_printing() {
            Err(eyre!(r#"
                Cannot swap materials while printing.
                Please pause your print first.
            "#))?;
        }

        for toolhead_input in msg.0.into_iter() {
            let material_id = toolhead_input.material_id.map(Into::into);

            Toolhead::set_material(
                &db,
                &mut data.config,
                &toolhead_input.id,
                &material_id,
            )
                .await?;
        }

        // Persist the config changes
        let data = self.get_data()?;
        data.config.save_config().await?;

        Ok(())
    }
}
