use async_graphql::{
    FieldResult,
    ID,
};

use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::{AxisEphemeral, Component, HeaterEphemeral, SpeedController, SpeedControllerEphemeral, Toolhead};

use crate::config_form::ConfigForm;

#[async_graphql::Object]
impl Component {
    async fn id(&self) -> ID {
        match self {
            Component::Controller(c) => c.id,
            Component::Axis(c) => c.id,
            Component::Toolhead(c) => c.id,
            Component::SpeedController(c) => c.id,
            Component::Video(c) => c.id,
            Component::BuildPlatform(c) => c.id,
        }.into()
    }

    async fn name(&self) -> &String {
        match self {
            Component::Controller(c) => &c.model.name,
            Component::Axis(c) => &c.model.name,
            Component::Toolhead(c) => &c.model.name,
            Component::SpeedController(c) => &c.model.name,
            Component::Video(c) => &c.model.name,
            Component::BuildPlatform(c) => &c.model.name,
        }
    }

    async fn address(&self) -> Option<&String> {
        match self {
            Component::Controller(c) => None,
            Component::Axis(c) => Some(&c.model.address),
            Component::Toolhead(c) => Some(&c.model.address),
            Component::SpeedController(c) => Some(&c.model.address),
            Component::Video(c) => None,
            Component::BuildPlatform(c) => Some(&c.model.address),
        }
    }

    async fn r#type(&self) -> String {
        match self {
            Component::Controller(_) => "CONTROLLER",
            Component::Axis(_) => "AXIS",
            Component::Toolhead(_) => "TOOLHEAD",
            Component::SpeedController(_) => "FAN",
            Component::Video(_) => "VIDEO",
            Component::BuildPlatform(_) => "BUILD_PLATFORM",
        }.to_string()
    }

    async fn config_form(&self) -> FieldResult<ConfigForm> {
        use Component::*;

        let config_form: Result<ConfigForm> = match self {
            Controller(c) => c.into(),
            Axis(c) => c.into(),
            Toolhead(c) => c.into(),
            SpeedController(c) => c.into(),
            Video(c) => c.into(),
            BuildPlatform(c) => c.into(),
        };

        Ok(config_form?)
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
                Some(&toolhead.ephemeral)
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
            Some(&toolhead)
        } else {
            None
        }
    }

    /// set if this component is a SpeedController. Null for all other components.
    async fn speed_controller(&self) -> Option<&SpeedControllerEphemeral> {
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
