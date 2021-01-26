use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::{components::{ComponentInner, Toolhead, ToolheadConfig}, machine::Machine};

use super::ResetWhenIdle;

#[xactor::message(result = "Result<()>")]
#[derive(Clone)]
pub struct UpdateComponent {
    pub id: String,
    pub version: i32,
    pub model: serde_json::Value,
}

#[async_trait::async_trait]
impl xactor::Handler<UpdateComponent> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: UpdateComponent) -> Result<()> {
        fn find_component_inner<'a, M, E: Default>(
            components: &'a mut Vec<ComponentInner<M, E>>,
            msg: &UpdateComponent,
        ) -> Result<&'a mut ComponentInner<M, E>> {
            components
                .iter_mut()
                .find(|c|
                    c.id == msg.id && c.model_version == msg.version
                )
                .ok_or_else(|| anyhow!("Component not found"))
        }

        // Controller
        let mut result: Result<()> = {
            let data = self.get_data()?;

            let mut c = find_component_inner(
                &mut data.config.controllers,
                &msg,
            )?;
            c.model = serde_json::from_value(msg.model.clone())?;
            c.model_version += 1;
            Ok(())
        };

        // Toolhead
        if result.is_err() {
            result = {
                let db = self.db.clone();
                let data = self.get_data()?;

                let mut c = find_component_inner(
                    &mut data.config.toolheads,
                    &msg,
                )?;
                let next_model: ToolheadConfig = serde_json::from_value(msg.model.clone())?;
                let material_id_changed = next_model.material_id != c.model.material_id;

                c.model = next_model;

                // material changes
                if material_id_changed {
                    let toolhead_id = c.id.clone();
                    let material_id = c.model.material_id.clone();

                    Toolhead::set_material(
                        &db,
                        data,
                        &toolhead_id,
                        &material_id,
                    )
                        .await?;
                } else {
                    // Toolhead::set_materials similarly increments the version number
                    c.model_version += 1;
                }

                Ok(())
            }
        }

        // Speed Controller
        if result.is_err() {
            result = {
                let data = self.get_data()?;
                let mut c = find_component_inner(
                    &mut data.config.speed_controllers,
                    &msg,
                )?;
                c.model = serde_json::from_value(msg.model.clone())?;
                c.model_version += 1;
                Ok(())
            }
        }

        // Video
        if result.is_err() {
            result = {
                let data = self.get_data()?;
                let mut c = find_component_inner(
                    &mut data.config.videos,
                    &msg,
                )?;
                c.model = serde_json::from_value(msg.model.clone())?;
                c.model_version += 1;
                Ok(())
            }
        }

        result?;

        let data = self.get_data()?;
        data.config.save_config().await?;
        ctx.address().send(ResetWhenIdle)?;

        Ok(())
    }
}
