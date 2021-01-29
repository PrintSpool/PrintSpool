// use std::path::Path;
use async_graphql::ID;
use serde::{Serialize, Deserialize};

use super::{
    Component,
    Controller,
    Toolhead,
    Video,
    Axis,
    Fan,
    BuildPlatform,
};
use std::path::PathBuf;

use eyre::{
    eyre,
    Result,
    // Context as _,
};

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
    pub model_version: u32,
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

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub id: ID,
    pub is_configured: bool,
    // Set to the name of the snap to connect an external teg-marlin process to the snap's
    // tmp directory and socket. Generally this is only useful for teg-marlin development.
    pub debug_snap_name: Option<String>,
    pub components: Vec<Component>,
    pub plugins: Vec<Plugin>,
}

#[derive(Debug, Clone)]
pub struct Feedrate {
    pub address: String,
    pub feedrate: f32,
    pub reverse_direction: bool,
    pub is_toolhead: bool,
}

impl Config {
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
            .ok_or_else(|| eyre!("Could not find @tegapp/core plugin config"))?;

        Ok(core_plugin)
    }

    pub fn name(&self) -> Result<String> {
        let name = self.core_plugin()?.model.name.clone();

        Ok(name)
    }

    pub fn get_controller(&self) -> &Controller {
        self.components.iter().find_map(|component| {
            if let Component::Controller( controller ) = component {
                Some(controller)
            } else {
                None
            }
        })
        .expect("No type=CONTROLLER component found in config")
    }

    pub fn get_videos(&self) -> impl std::iter::Iterator<Item = &Video> {
        self.components.iter().filter_map(|component| {
            if let Component::Video( video ) = component {
                Some(video)
            } else {
                None
            }
        })
    }

    pub fn tty_path(&self) -> &String {
        &self.get_controller().serial_port_id
    }

    pub fn axes(&self) -> impl std::iter::Iterator<Item = &Axis> {
        self.components.iter().filter_map(|component| {
            if let Component::Axis( axis ) = component {
                Some(axis)
            } else {
                None
            }
        })
    }

    pub fn at_address(&self, address: &str) -> Option<&Component> {
        self.components
            .iter()
            .find(|component| {
                match component {
                    Component::Controller(_) => false,
                    Component::Axis(c) => c.address == address,
                    Component::Toolhead(c) => c.address == address,
                    Component::Fan(c) => c.address == address,
                    Component::Video(_) => false,
                    Component::BuildPlatform(c) => c.address == address,
                }
            })
    }

    pub fn toolheads<'a>(&'a self) -> impl std::iter::Iterator<Item = &'a Toolhead> {
        self.components.iter().filter_map(|component| {
            match component {
                Component::Toolhead(toolhead) => {
                    Some(toolhead)
                },
                _ => None,
            }
        })
    }

    pub fn feedrates(&self) -> impl std::iter::Iterator<Item = Feedrate> {
        self.components.clone().into_iter().filter_map(|component| {
            match component {
                Component::Axis( axis ) => Some(Feedrate {
                    address: axis.address.clone(),
                    feedrate: axis.feedrate,
                    reverse_direction: axis.reverse_direction,
                    is_toolhead: false,
                }),
                Component::Toolhead( toolhead ) => Some(Feedrate {
                    address: toolhead.address.clone(),
                    feedrate: toolhead.feedrate,
                    reverse_direction: false,
                    is_toolhead: true,
                }),
                _ => None,
            }
        })
    }

    pub fn heater_addresses(&self) -> Vec<String> {
        self.components
            .iter()
            .filter_map(|component| {
                match component {
                    | Component::BuildPlatform(BuildPlatform { heater: true, address })
                    | Component::Toolhead(Toolhead { heater: true, address, .. }) => {
                        Some(address.clone())
                    }
                    _ => None
                }
            })
            .collect()
    }

    pub fn fan_addresses(&self) -> Vec<String> {
        self.components
            .iter()
            .filter_map(|component| {
                match component {
                    | Component::Fan(Fan { address, .. }) => {
                        Some(address.clone())
                    }
                    _ => None
                }
            })
            .collect()
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
