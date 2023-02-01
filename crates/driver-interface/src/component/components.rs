mod axis;
pub use axis::*;

mod build_platform;
pub use build_platform::*;

mod heater;
pub use heater::*;

mod fan;
pub use fan::*;

mod toolhead;
pub use toolhead::*;

mod video;
pub use video::*;

mod controller;
pub use controller::*;

mod configurable_component;
pub mod resolvers;

mod component_inner;
pub use component_inner::ComponentInner;

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
