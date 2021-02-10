use serde::{Serialize, Deserialize};
use nanoid::nanoid;

mod axis;
pub use axis::*;

mod build_platform;
pub use build_platform::*;

mod heater;
pub use heater::*;

mod speed_controller;
pub use speed_controller::*;

mod toolhead;
pub use toolhead::*;

mod video;
pub use video::*;

mod controller;
pub use controller::*;

pub mod resolvers;
mod into_config_form;

#[derive(new, Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ComponentInner<Model, Ephemeral: Default> {
    #[new(value = "nanoid!(11)")]
    pub id: String,
    #[new(default)]
    pub model_version: teg_json_store::Version,
    pub model: Model,
    #[serde(skip)]
    #[new(default)]
    pub ephemeral: Ephemeral,
}

// #[derive(Serialize, Deserialize, Debug, Clone)]
// #[serde(tag = "type", content = "model")]
pub enum Component {
    // #[serde(rename = "CONTROLLER")]
    Controller(Controller),
    // #[serde(rename = "AXIS", rename_all = "camelCase")]
    Axis(Axis),
    // #[serde(rename = "TOOLHEAD", rename_all = "camelCase")]
    Toolhead(Toolhead),
    // #[serde(rename = "FAN", rename_all = "camelCase")]
    SpeedController(SpeedController),
    // #[serde(rename = "VIDEO", rename_all = "camelCase")]
    Video(Video),
    // #[serde(rename = "BUILD_PLATFORM", rename_all = "camelCase")]
    BuildPlatform(BuildPlatform),
}


#[derive(async_graphql::Enum, Copy, Clone, Eq, PartialEq, Debug)]
#[graphql(name = "ComponentType")]
pub enum ComponentTypeGQL {
    #[graphql(name = "CONTROLLER")]
    Controller,
    #[graphql(name = "AXIS")]
    Axis,
    #[graphql(name = "TOOLHEAD")]
    Toolhead,
    #[graphql(name = "FAN")]
    SpeedController,
    #[graphql(name = "VIDEO")]
    Video,
    #[graphql(name = "BUILD_PLATFORM")]
    BuildPlatform,
}

// impl<T, U> Configurable for ComponentInner<T, U>
// where
//     T: JsonSchema + Serialize,
//     U: Default,
// {

//     // fn validate(&self, json: &serde_json::Value) -> Result<()> {
//         // let rootSchema = schemars::schema_for!(T);
//         // let schema = serde_json::to_value(rootSchema)?;
//     //     let compiled = JSONSchema::compile(&self.schema()?)?;
//     //     compiled.validate(&json)?

//     //     Ok(())
//     // }
// }


// pub trait Configurable {
//     fn config_form(&self) -> Result<ConfigForm>;
//     // fn validate(&self, json: &serde_json::Value) -> Result<()>;
// }
