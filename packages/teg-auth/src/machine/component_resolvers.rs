use std::sync::Arc;
use async_graphql::*;

// use super::models::{
//     Machine,
// };

use crate::configuration::{
    Component
};

// use crate::models::{
//     VersionedModel,
//     // VersionedModelError,
// };

/// A spooled set of gcodes to be executed by the machine
#[Object]
impl Component {
    async fn id(&self) -> ID { "NOT_IMPLEMENTED_YET".into() }
    // async fn id(&self) -> &ID { self.id }

    async fn r#type<'ctx>(&self) -> FieldResult<String> {
        let value = match self {
            Component::Controller(_) => "CONTROLLER",
            Component::Axis(_) => "AXIS",
            Component::Toolhead(_) => "TOOLHEAD",
            Component::Fan(_) => "FAN",
            Component::Video(_) => "VIDEO",
            Component::BuildPlatform(_) => "BUILD_PLATFORM",
        };

        Ok(value.to_string())
    }
}
