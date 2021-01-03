use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use async_graphql::{
    ID,
};

use crate::machine::Machine;

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsInput {
    #[graphql(name: "machineID")]
    pub machine_id: ID,
    pub toolheads: Vec<SetMaterialsToolhead>,
}

#[derive(async_graphql::InputObject, Debug)]
pub struct SetMaterialsToolhead {
    pub id: ID,
    #[graphql(name: "materialID")]
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
            Err(anyhow!(r#"
                Cannot swap materials while printing.
                Please pause your print first.
            "#))?;
        }

        for toolhead_input in msg.0.into_iter() {
            let toolhead_id: String = toolhead_input.id.into();

            // Get the toolhead
            let toolhead = data.config.toolheads
                .iter_mut()
                .find(|toolhead| {
                    toolhead.id == toolhead_id
                })
                .ok_or_else(|| anyhow!("Toolhead not found"))?;

            if let Some(material_id) = toolhead_input.material_id {
                let material_id: crate::DbId = material_id.parse()?;

                // Verify that the material id exists
                sqlx::query!(
                    "SELECT id FROM materials WHERE id = ?",
                    material_id,
                )
                    .fetch_one(&db)
                    .await?;

                // Set the material id
                toolhead.model.material_id = Some(material_id);
            } else {
                toolhead.model.material_id = None;
            }
        }

        data.config.save_config().await?;

        Ok(())
    }
}
