use eyre::{
    eyre,
    Result,
    // Context as _,
};
use serde::de::DeserializeOwned;

use crate::{
    components::{
        Component,
        ComponentInner,
        Toolhead,
    },
    config::validate_model,
    machine::Machine
};

use super::ResetWhenIdle;

#[xactor::message(result = "Result<()>")]
#[derive(Clone)]
pub struct UpdateComponent {
    pub id: String,
    pub version: i32,
    pub model: serde_json::Value,
}

fn get_component_and_next_model<'a, M: validator::Validate + DeserializeOwned, E: Default>(
    components: &'a mut Vec<ComponentInner<M, E>>,
    msg: &UpdateComponent,
) -> Result<(&'a mut ComponentInner<M, E>, M)> {
    let component = components
        .iter_mut()
        .find(|c|
            c.id == msg.id && c.model_version == msg.version
        )
        .ok_or_else(|| eyre!("Component not found"))?;

    let next_model: M = validate_model(msg.model.clone())?;
    Ok((component, next_model))
}

fn update_component_inner<'a, M: validator::Validate + DeserializeOwned, E: Default>(
    components: &mut Vec<ComponentInner<M, E>>,
    msg: &UpdateComponent,
) -> Result<()> {
    let (
        component,
        next_model,
    ) = get_component_and_next_model(components, msg)?;

    component.model = next_model;
    component.model_version += 1;

    Ok(())
}

#[async_trait::async_trait]
impl xactor::Handler<UpdateComponent> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: UpdateComponent) -> Result<()> {
        let db = self.db.clone();
        let machine_config = &mut self.get_data()?.config;

        let component_clone = machine_config.components()
            .into_iter()
            .find(|(id, _)| {
                **id == msg.id
            })
            .ok_or_else(|| eyre!("Component not found"))?
            .1;

        match component_clone {
            Component::Controller(_) => {
                update_component_inner(&mut machine_config.controllers, &msg)?
            }
            Component::Axis(_) => {
                update_component_inner(&mut machine_config.axes, &msg)?
            }
            Component::Toolhead(_) => {
                let (
                    mut component,
                    next_model,
                ) = get_component_and_next_model(
                    &mut machine_config.toolheads,
                    &msg,
                )?;

                let previous_version = component.model_version;
                let material_id_changed = next_model.material_id != component.model.material_id;

                // material changes
                if material_id_changed {
                    let toolhead_id = component.id.clone();
                    let material_id = next_model.material_id.clone();

                    component = Toolhead::set_material(
                        &db,
                        machine_config,
                        &toolhead_id,
                        &material_id,
                    )
                        .await?;
                    // Toolhead::set_materials internally increments the version number
                    component.model_version = previous_version;
                }

                component.model = next_model;
                component.model_version += 1;
            }
            Component::SpeedController(_) => {
                update_component_inner(&mut machine_config.speed_controllers, &msg)?
            }
            Component::Video(_) => {
                update_component_inner(&mut machine_config.videos, &msg)?
            }
            Component::BuildPlatform(_) => {
                update_component_inner(&mut machine_config.build_platforms, &msg)?
            }
        }

        let data = self.get_data()?;
        data.config.save_config().await?;
        ctx.address().send(ResetWhenIdle)?;

        Ok(())
    }
}
