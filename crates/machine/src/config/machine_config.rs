// use std::path::Path;
use async_graphql::ID;
use serde::{Serialize, Deserialize};
use std::path::PathBuf;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::components::{
    Axis,
    BuildPlatform,
    BuildPlatformConfig,
    ControllerConfig,
    HeaterEphemeral,
    SpeedController,
    SpeedControllerConfig,
    Toolhead,
    ToolheadConfig,
    Video,
};
use super::{
    Feedrate,
    Plugin,
    PluginContainer,
    CorePluginModel,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MachineConfig {
    pub id: ID,
    pub is_configured: bool,
    // Set to the name of the snap to connect an external teg-marlin process to the snap's
    // tmp directory and socket. Generally this is only useful for teg-marlin development.
    pub debug_snap_name: Option<String>,

    // Components
    pub controllers: Vec<Controller>,
    pub axes: Vec<Axis>,
    pub build_platforms: Vec<BuildPlatform>,
    pub toolheads: Vec<Toolhead>,
    pub speed_controllers: Vec<SpeedController>,
    pub videos: Vec<Video>,

    // Plugins
    pub plugins: Vec<Plugin>,
}

impl MachineConfig {
    pub fn core_plugin<'a>(&'a self) -> Result<&'a PluginContainer<CorePluginModel>> {
        let core_plugin = self.plugins.iter()
            .find_map(|plugin| {
                match plugin {
                    Plugin::Core(core_plugin) => {
                        Some(core_plugin)
                    }
                    _ => None,
                }
            })
            .ok_or_else(|| anyhow!("Could not find @tegapp/core plugin config"))?;

        Ok(core_plugin)
    }

    pub fn name(&self) -> Result<String> {
        let name = self.core_plugin()?.model.name.clone();

        Ok(name)
    }

    pub fn get_controller(&self) -> &ControllerConfig {
        self.controllers.get(0)
            .expect("No controller found in config")
    }

    pub fn tty_path(&self) -> &String {
        &self.get_controller().serial_port_id
    }

    pub fn get_heater_mut(&mut self, address: String) -> &mut HeaterEphemeral {
        if let Some(toolhead) = self.toolheads.iter_mut().find(|c| c.address == address) {
            Some(toolhead.ephemeral)
        } else if let Some(build_platform) = self.build_platforms.iter_mut().find(|c| c.address == address) {
            Some(build_platform.ephemeral)
        } else {
            None
        }
    }

    pub fn feedrates(&self) -> impl std::iter::Iterator<Item = Feedrate> {
        let axe_feedrates = self.axes.iter()
            .map(|Axis { model: axis, .. }| {
                Feedrate {
                    address: axis.address.clone(),
                    feedrate: axis.feedrate,
                    reverse_direction: axis.reverse_direction,
                    is_toolhead: false,
                }
            });

        let toolhead_feedrates = self.axes.iter()
            .map(|ToolheadConfig { model: toolhead, .. }| {
                Feedrate {
                    address: toolhead.address.clone(),
                    feedrate: toolhead.feedrate,
                    reverse_direction: false,
                    is_toolhead: true,
                }
            });

        axe_feedrates.chain(toolhead_feedrates)
    }

    pub fn var_path(&self) -> PathBuf {
        let path = if let Some(snap_name) = &self.debug_snap_name {
            format!("/var/snap/{}/current/var", snap_name)
        } else {
            "/var/lib/teg".to_string()
        };

        PathBuf::from(path)
    }

    pub fn socket_path(&self) -> PathBuf {
        let file_name = format!("machine-{}.sock", self.id.to_string());

        self.var_path().join(file_name)
    }

    pub fn backups_dir(&self) -> PathBuf {
        self.var_path().join("backups")
    }
}
