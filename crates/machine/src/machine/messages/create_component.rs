use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::{
    components::{
        ComponentTypeGQL,
        Controller,
        ControllerConfig,
        SpeedController,
        SpeedControllerConfig,
        Toolhead,
        ToolheadConfig,
        Video,
        VideoConfig
    },
    machine::Machine,
    config::validate_model,
};

use super::ResetWhenIdle;

#[xactor::message(result = "Result<()>")]
pub struct CreateComponent {
    pub component_type: ComponentTypeGQL,
    pub model: serde_json::Value,
}

#[async_trait::async_trait]
impl xactor::Handler<CreateComponent> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: CreateComponent) -> Result<()> {
        let data = self.get_data()?;

        let model = msg.model;

        match msg.component_type {
            ComponentTypeGQL::Controller => {
                let config: ControllerConfig = validate_model(model)?;
                let component = Controller::new(config);
                data.config.controllers.push(component)
            }
            ComponentTypeGQL::Toolhead => {
                let config: ToolheadConfig = validate_model(model)?;
                let component = Toolhead::new(config);
                data.config.toolheads.push(component);
            }
            ComponentTypeGQL::SpeedController => {
                let config: SpeedControllerConfig = validate_model(model)?;
                let component = SpeedController::new(config);
                data.config.speed_controllers.push(component);
            }
            ComponentTypeGQL::Video => {
                let config: VideoConfig = validate_model(model)?;
                let component = Video::new(config);
                data.config.videos.push(component);
            }
            _ => Err(eyre!("Type not allowed for creation: {:?}", msg.component_type))?,
        };

        data.config.save_config().await?;
        ctx.address().send(ResetWhenIdle)?;

        Ok(())
    }
}
