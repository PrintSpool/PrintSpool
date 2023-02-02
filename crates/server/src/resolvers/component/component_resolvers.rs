use async_graphql::{FieldResult, ID};
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };

use super::super::{AxisEphemeral, Component, FanEphemeral, HeaterEphemeral, Toolhead};
use printspool_config_form::ConfigForm;

#[derive(Deref, DerefMut)]
pub struct ComponentResolvers(Component);

#[async_graphql::Object]
impl ComponentResolvers {
    async fn id(&self) -> ID {
        use Component::*;

        match self {
            Controller(c) => &c.id,
            Axis(c) => &c.id,
            Toolhead(c) => &c.id,
            SpeedController(c) => &c.id,
            Video(c) => &c.id,
            BuildPlatform(c) => &c.id,
        }
        .into()
    }

    async fn name(&self) -> &String {
        use Component::*;

        match self {
            Controller(c) => &c.model.name,
            Axis(c) => &c.model.name,
            Toolhead(c) => &c.model.name,
            SpeedController(c) => &c.model.name,
            Video(c) => &c.model.name,
            BuildPlatform(c) => &c.model.name,
        }
    }

    async fn r#type(&self) -> String {
        use Component::*;

        match self {
            Controller(_) => "CONTROLLER",
            Axis(_) => "AXIS",
            Toolhead(_) => "TOOLHEAD",
            SpeedController(_) => "FAN",
            Video(_) => "VIDEO",
            BuildPlatform(_) => "BUILD_PLATFORM",
        }
        .to_string()
    }

    async fn address(&self) -> Option<&String> {
        use Component::*;

        match self {
            Controller(_) => None,
            Axis(c) => Some(&c.model.address),
            Toolhead(c) => Some(&c.model.address),
            SpeedController(c) => Some(&c.model.address),
            Video(_) => None,
            BuildPlatform(c) => Some(&c.model.address),
        }
    }

    async fn config_form(&self) -> FieldResult<ConfigForm> {
        use printspool_config_form::into_config_form;
        use Component::*;

        let config_form = match self {
            Controller(c) => into_config_form(c),
            Axis(c) => into_config_form(c),
            Toolhead(c) => into_config_form(c),
            SpeedController(c) => into_config_form(c),
            Video(c) => into_config_form(c),
            BuildPlatform(c) => into_config_form(c),
        }?;

        Ok(config_form)
    }

    /// set if this component is an axis. Null for all other components.
    async fn axis(&self) -> Option<&AxisEphemeral> {
        if let Component::Axis(axis) = self {
            Some(&axis.ephemeral)
        } else {
            None
        }
    }

    /// set if this component contains a heater. Null for non-heater components.
    async fn heater(&self) -> Option<&HeaterEphemeral> {
        if let Component::Toolhead(toolhead) = self {
            if toolhead.model.heater {
                Some(&toolhead.ephemeral.heater)
            } else {
                None
            }
        } else if let Component::BuildPlatform(build_platform) = self {
            if build_platform.model.heater {
                Some(&build_platform.ephemeral)
            } else {
                None
            }
        } else {
            None
        }
    }

    /// set if this component contains a toolhead. Null for non-toolhead components.
    async fn toolhead(&self) -> Option<&Toolhead> {
        if let Component::Toolhead(toolhead) = self {
            Some(toolhead)
        } else {
            None
        }
    }

    /// set if this component is a SpeedController. Null for all other components.
    async fn speed_controller(&self) -> Option<&FanEphemeral> {
        if let Component::SpeedController(speed_controller) = self {
            Some(&speed_controller.ephemeral)
        } else {
            None
        }
    }
}

//   type MovementDataPoint {
//     address: String!
//     value: Float!
//   }

//   # type MovementHistoryEntry {
//   #   id: ID!
//   #   createdAt: DateTime!
//   #   position: [MovementDataPoint!]!
//   #   inboundFeedrate: Float!
//   # }
