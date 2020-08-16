// use std::path::Path;
use async_graphql::ID;
use serde::{Serialize, Deserialize};

use super::{
    Component,
    Controller,
    Toolhead,
    Video,
    Axis,
};
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub id: ID,
    pub is_configured: bool,
    // Set to the name of the snap to connect an external teg-marlin process to the snap's
    // tmp directory and socket. Generally this is only useful for teg-marlin development.
    pub debug_snap_name: Option<String>,
    components: Vec<Component>,
}

#[derive(Debug, Clone)]
pub struct Feedrate {
    pub address: String,
    pub feedrate: f32,
    pub is_toolhead: bool,
}

impl Config {
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

    pub fn toolhead(&self, address: &str) -> Option<&Toolhead> {
        self.components
            .iter()
            .find_map(|component| {
                match component {
                    Component::Toolhead(toolhead) if toolhead.address == address => {
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
                    is_toolhead: false,
                }),
                Component::Toolhead( toolhead ) => Some(Feedrate {
                    address: toolhead.address.clone(),
                    feedrate: toolhead.feedrate,
                    is_toolhead: false,
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
                    | Component::BuildPlatform { heater: true, address }
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
                    | Component::Fan { address, .. } => {
                        Some(address.clone())
                    }
                    _ => None
                }
            })
            .collect()
    }

    pub fn transform_gcode_file_path(&self, file_path: String) -> String {
        if let Some(snap_name) = &self.debug_snap_name {
            format!("/tmp/snap.{}{}", snap_name, file_path)
        } else {
            file_path
        }
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
