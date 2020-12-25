// use std::sync::Arc;
use async_graphql::{
    Object,
    ID,
    // Context,
    FieldResult,
};
// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };
use std::collections::VecDeque;
use teg_config_form::ConfigForm;

use crate::machine::{
    MachineData,
    models::MachineStatusGQL,
};
use crate::components::{
    Component
};
use super::models::GCodeHistoryEntry;

#[Object]
impl MachineData {
    async fn id(&self) -> ID { self.config.id.into() }
    async fn status(&self) -> MachineStatusGQL { self.status.clone().into() }
    async fn paused(&self) -> bool { self.paused_task_id.is_some() }

    async fn name(&self) -> FieldResult<String> {
        Ok(self.config.name()?)
    }

    // TODO: config_form
    /// The machine configuration for general settings.
    async fn config_form(&self) -> FieldResult<ConfigForm> {
        Ok(self.config.into()?)
    }

    async fn components(&self) -> Vec<Component> {
        self.config.components()
    }

    async fn fixed_list_component_types(&self) -> FieldResult<Vec<String>> {
        Ok(vec![
            "CONTROLLER".into(),
            "AXIS".into(),
            "BUILD_PLATFORM".into(),
        ])
    }

    // TODO: Plugins
    // async fn plugins(&self) -> Vec<Plugin> {
    //     vec![]
    // }

    async fn available_packages(&self) -> FieldResult<Vec<String>> {
        Ok(vec![])
    }

    // TODO: Viewers
    // async fn viewers(&self) -> Vec<MachineViewer> {
    //     self.config.components()
    // }

    async fn swap_x_and_y_orientation(&self) -> bool { self.config.swap_x_and_y_orientation }
    async fn motors_enabled(&self) -> bool { self.motors_enabled }
    async fn error(&self) -> &MachineError { &self.error }

    async fn enabled_macros(&self) -> Vec<String> {
        vec![
            "home".into(),
            "setTargetTemperatures".into(),
            "toggleFans".into(),
            "toggleHeaters".into(),
            "toggleMotorsEnabled".into(),
            "continuousMove".into(),
            "moveBy".into(),
            "moveTo".into(),
        ]
    }

    async fn gcode_history(&self, limit: u32) -> VecDeque<GCodeHistoryEntry> {
        self.gcode_history
    }
}
