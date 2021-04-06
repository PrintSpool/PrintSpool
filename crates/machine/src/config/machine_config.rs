// use std::path::Path;
use serde::{Serialize, Deserialize};
use std::path::PathBuf;
use eyre::{
    eyre,
    Result,
    Context as _,
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
    // Set to the name of the snap to connect an external teg-marlin process to the snap's
    // tmp directory and socket. Generally this is only useful for teg-marlin development.
    #[serde(default)]
    pub debug_snap_name: Option<String>,

    // Components
    #[serde(default, skip_serializing_if="Vec::is_empty")]
    pub controllers: Vec<Controller>,
    #[serde(default, skip_serializing_if="Vec::is_empty")]
    pub axes: Vec<Axis>,
    #[serde(default, skip_serializing_if="Vec::is_empty")]
    pub build_platforms: Vec<BuildPlatform>,
    #[serde(default, skip_serializing_if="Vec::is_empty")]
    pub toolheads: Vec<Toolhead>,
    #[serde(default, skip_serializing_if="Vec::is_empty")]
    pub speed_controllers: Vec<SpeedController>,
    #[serde(default, skip_serializing_if="Vec::is_empty")]
    pub videos: Vec<Video>,

    // Plugins
    #[serde(default)]
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
            .ok_or_else(|| eyre!("Could not find teg-core plugin config"))?;

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
            .ok_or_else(|| eyre!("Could not find teg-core plugin config"))?;

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
            Some(&mut toolhead.ephemeral.heater)
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

    /// Data in var-common is shared across Snap refresh versions. This is useful for machine
    /// sockets when a new server needs to connect to a previous version of the driver.
    pub fn var_common_path(&self) -> PathBuf {
        let path = if let Some(snap_name) = &self.debug_snap_name {
            format!("/var/snap/{}/common/var", snap_name)
        } else {
            "/var/lib/teg-common".to_string()
        };

        PathBuf::from(path)
    }

    pub fn socket_path(&self) -> PathBuf {
        let file_name = format!("machine-{}.sock", self.id.to_string());

        self.var_common_path().join(file_name)
    }

    pub fn backups_dir(&self) -> PathBuf {
        self.var_path().join("backups")
    }

    pub fn components<'a>(&'a self) -> Vec<(&'a crate::DbId, Component)> {
        use Component::*;

        std::iter::empty()
            .chain(self.controllers.iter().map(|c|
                (&c.id, Controller(c.clone()))
            ))
            .chain(self.axes.iter().map(|c|
                (&c.id, Axis(c.clone()))
            ))
            .chain(self.toolheads.iter().map(|c|
                (&c.id, Toolhead(c.clone()))
            ))
            .chain(self.speed_controllers.iter().map(|c|
                (&c.id, SpeedController(c.clone()))
            ))
            .chain(self.videos.iter().map(|c|
                (&c.id, Video(c.clone()))
            ))
            .chain(self.build_platforms.iter().map(|c|
                (&c.id, BuildPlatform(c.clone()))
            ))
            .collect()
    }

    pub fn heater_addresses(&self) -> Vec<String> {
        std::iter::empty()
            .chain(self.toolheads.iter().map(|c| {
                c.model.address.clone()
            }))
            .chain(self.build_platforms.iter().map(|c| {
                c.model.address.clone()
            }))
            .collect()
    }

    pub async fn save_config(&self) -> Result<()> {
        let config_content = toml::to_string(&self)
            .wrap_err("Error serializing machine config")?;
        async_std::fs::write(
            Self::config_file_path(&self.id),
            config_content,
        ).await?;

        Ok(())
    }

    pub fn transform_gcode_file_path(&self, file_path: String) -> String {
        if let Some(snap_name) = &self.debug_snap_name {
            format!("/tmp/snap.{}{}", snap_name, file_path)
        } else {
            file_path
        }
    }

    pub fn config_file_path(id: &crate::DbId) -> String {
        format!("/etc/teg/machine-{}.toml", id)
    }

    pub fn pid_file_path(id: &crate::DbId) -> String {
        format!("/var/tmp/teg-machine-{}.pid", id)
    }
}
