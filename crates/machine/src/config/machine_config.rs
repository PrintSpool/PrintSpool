// use std::path::Path;
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
    Component,
    Controller,
    HeaterEphemeral,
    SpeedController,
    Toolhead,
    Video,
};
use crate::plugins::{
    Plugin,
    PluginContainer,
    core::CorePluginConfig,
};
use super::{
    Feedrate,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MachineConfig {
    pub id: crate::DbId,
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
    pub fn core_plugin<'a>(&'a self) -> Result<&'a PluginContainer<CorePluginConfig>> {
        let core_plugin = self.plugins.iter()
            .find_map(|plugin| {
                match plugin {
                    Plugin::Core(core_plugin) => {
                        Some(core_plugin)
                    }
                    // _ => None,
                }
            })
            .ok_or_else(|| anyhow!("Could not find @tegapp/core plugin config"))?;

        Ok(core_plugin)
    }

    pub fn core_plugin_mut<'a>(&'a mut self) -> Result<&'a mut PluginContainer<CorePluginConfig>> {
        let core_plugin = self.plugins.iter_mut()
            .find_map(|plugin| {
                match plugin {
                    Plugin::Core(core_plugin) => {
                        Some(core_plugin)
                    }
                    // _ => None,
                }
            })
            .ok_or_else(|| anyhow!("Could not find @tegapp/core plugin config"))?;

        Ok(core_plugin)
    }

    pub fn name(&self) -> Result<String> {
        let name = self.core_plugin()?.model.name.clone();

        Ok(name)
    }

    pub fn get_controller(&self) -> &Controller {
        self.controllers.get(0)
            .expect("No controller found in config")
    }

    pub fn get_controller_mut(&mut self) -> &mut Controller {
        self.controllers.get_mut(0)
            .expect("No controller found in config")
    }

    pub fn tty_path(&self) -> &String {
        &self.get_controller().model.serial_port_id
    }

    pub fn get_heater_mut(&mut self, address: &String) -> Option<&mut HeaterEphemeral> {
        if let Some(toolhead) = self.toolheads
            .iter_mut()
            .find(|c| &c.model.address == address)
        {
            Some(&mut toolhead.ephemeral)
        } else if let Some(build_platform) = self.build_platforms
            .iter_mut()
            .find(|c| &c.model.address == address)
        {
            Some(&mut build_platform.ephemeral)
        } else {
            None
        }
    }

    pub fn feedrates(&self) -> Vec<Feedrate> {
        let axe_feedrates = self.axes.iter()
            .map(|Axis { model: axis, .. }| {
                Feedrate {
                    address: axis.address.clone(),
                    feedrate: axis.feedrate,
                    reverse_direction: axis.reverse_direction,
                    is_toolhead: false,
                }
            });

        let toolhead_feedrates = self.toolheads.iter()
            .map(|Toolhead { model: toolhead, .. }| {
                Feedrate {
                    address: toolhead.address.clone(),
                    feedrate: toolhead.feedrate,
                    reverse_direction: false,
                    is_toolhead: true,
                }
            });

        axe_feedrates.chain(toolhead_feedrates).collect()
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

    pub fn components(&self) -> Vec<Component> {
        use Component::*;

        std::iter::empty()
            .chain(self.controllers.iter().map(|c| Controller(c.clone())))
            .chain(self.axes.iter().map(|c| Axis(c.clone())))
            .chain(self.toolheads.iter().map(|c| Toolhead(c.clone())))
            .chain(self.speed_controllers.iter().map(|c| SpeedController(c.clone())))
            .chain(self.videos.iter().map(|c| Video(c.clone())))
            .chain(self.build_platforms.iter().map(|c| BuildPlatform(c.clone())))
            .collect()
    }

    pub async fn save_config(&self) -> Result<()> {
        let config_content = toml::to_string(&self)?;
        async_std::fs::write(
            Self::config_file_path(self.id),
            config_content,
        ).await?;

        Ok(())
    }

    pub fn config_file_path(id: crate::DbId) -> String {
        format!("/etc/teg/machine-{}.toml", id)
    }
}
