use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::{
    components::ComponentInner,
    machine::Machine,
};

use super::ResetWhenIdle;

#[xactor::message(result = "Result<()>")]
#[derive(Clone)]
pub struct UpdateComponent {
    pub id: String,
    pub version: crate::DbId,
    pub model: serde_json::Value,
}

#[async_trait::async_trait]
impl xactor::Handler<UpdateComponent> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: UpdateComponent) -> Result<()> {
        let data = self.get_data()?;

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

        Result::<()>::Ok(())
            .and_then(|_| -> Result<()> {
                let mut c = find_component_inner(
                    &mut data.config.controllers,
                    &msg,
                )?;
                c.model = serde_json::from_value(msg.model.clone())?;
                c.model_version += 1;
                Ok(())
            })
            .or_else(|_| -> Result<()> {
                let mut c = find_component_inner(
                    &mut data.config.toolheads,
                    &msg,
                )?;
                c.model = serde_json::from_value(msg.model.clone())?;
                c.model_version += 1;
                Ok(())
            })
            .or_else(|_| -> Result<()> {
                let mut c = find_component_inner(
                    &mut data.config.speed_controllers,
                    &msg,
                )?;
                c.model = serde_json::from_value(msg.model.clone())?;
                c.model_version += 1;
                Ok(())
            })
            .or_else(|_| -> Result<()> {
                let mut c = find_component_inner(
                    &mut data.config.videos,
                    &msg,
                )?;
                c.model = serde_json::from_value(msg.model.clone())?;
                c.model_version += 1;
                Ok(())
            })?;

        data.config.save_config().await?;
        ctx.address().send(ResetWhenIdle)?;

        Ok(())
    }
}
