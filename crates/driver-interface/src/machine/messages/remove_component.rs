use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use async_graphql::{
    ID,
};

use crate::{components::ComponentInner, machine::Machine};

use super::ResetWhenIdle;

#[xactor::message(result = "Result<()>")]
pub struct RemoveComponent(pub ID);

fn remove_component<M, E: Default>(
    id: &String,
    components: &mut Vec<ComponentInner<M, E>>
) {
    components.retain(|c| &c.id != id);
}

#[async_trait::async_trait]
impl xactor::Handler<RemoveComponent> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: RemoveComponent) -> Result<()> {
        let data = self.get_data()?;

        let id: String = msg.0.into();

        remove_component(&id, &mut data.config.axes);
        remove_component(&id, &mut data.config.toolheads);
        remove_component(&id, &mut data.config.speed_controllers);
        remove_component(&id, &mut data.config.videos);

        data.config.save_config().await?;
        ctx.address().send(ResetWhenIdle)?;

        Ok(())
    }
}
