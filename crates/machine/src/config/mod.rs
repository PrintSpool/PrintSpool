use async_graphql::ID;
use serde::{Serialize, Deserialize};

use crate::components::{
    Component,
    ControllerConfig,
    Toolhead,
    ToolheadConfig,
    Video,
    Axis,
    SpeedController,
    SpeedControllerConfig,
    BuildPlatform,
    BuildPlatformConfig,
};
use std::path::PathBuf;

use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
mod machine_config;
pub use machine_config::{ MachineConfig };


#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "package")]
pub enum Plugin {
    #[serde(rename = "@tegapp/core")]
    Core(PluginContainer<CorePluginModel>),
    #[serde(other)]
    UnknownPlugin,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PluginContainer<Model = toml::Value> {
    pub id: ID,
    pub model_version: u64,
    pub model: Model,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CorePluginModel {
    pub name: String,
    #[serde(default)]
    pub automatic_printing: bool,
    pub before_print_hook: String,
    pub after_print_hook: String,
    #[serde(default)]
    pub pause_hook: String,
    #[serde(default)]
    pub resume_hook: String,
    #[serde(default)]
    pub swap_x_and_y_orientation: bool,
    #[serde(default)]
    pub macros: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct Feedrate {
    pub address: String,
    pub feedrate: f32,
    pub reverse_direction: bool,
    pub is_toolhead: bool,
}
