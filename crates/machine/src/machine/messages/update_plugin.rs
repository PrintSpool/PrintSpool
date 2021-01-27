use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::{
    machine::Machine,
};

use super::ResetWhenIdle;

#[xactor::message(result = "Result<()>")]
#[derive(Clone)]
pub struct UpdatePlugin {
    pub plugin_id: String,
    pub version: i32,
    pub model: serde_json::Value,
}

#[async_trait::async_trait]
impl xactor::Handler<UpdatePlugin> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: UpdatePlugin) -> Result<()> {
        let data = self.get_data()?;

        if &msg.plugin_id[..] != "teg-core" {
            Err(anyhow!("Plugin not found: {}", msg.plugin_id))?
        }

        let plugin = data.config.core_plugin_mut()?;

        if plugin.model_version != msg.version {
            Err(anyhow!("Editing conflict, please reload the page and try again."))?
        }

        plugin.model = serde_json::from_value(msg.model)?;
        plugin.model_version += 1;

        data.config.save_config().await?;
        ctx.address().send(ResetWhenIdle)?;

        Ok(())
    }
}
