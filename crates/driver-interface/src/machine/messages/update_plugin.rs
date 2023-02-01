use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::{machine::Machine, plugins::Plugin};

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
            Err(eyre!("Plugin not found: {}", msg.plugin_id))?
        }

        let plugin = data.config.core_plugin_mut()?;

        if plugin.model_version != msg.version {
            Err(eyre!("Editing conflict, please reload the page and try again."))?
        }

        let _previous = std::mem::replace(
            &mut plugin.model,
            serde_json::from_value(msg.model)?,
        );
        plugin.model_version += 1;

        data.config.save_config().await?;
        ctx.address().send(ResetWhenIdle)?;

        // Need an immutable reference to the containing Plugin enum to send to the machine hooks
        let data = self.data.as_ref().unwrap();
        let plugin = data.config.plugins
            .iter()
            .find(|plugin| {
                match plugin {
                    Plugin::Core(_) => {
                        true
                    }
                }
            })
            .ok_or_else(|| eyre!("Could not find teg-core plugin config"))?;

        for hooks_provider in self.hooks.iter() {
            hooks_provider.after_plugin_update(
                &data.config.id,
                plugin,
            ).await?
        }

        Ok(())
    }
}
