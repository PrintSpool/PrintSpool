// use std::path::Path;
use serde::{Serialize, Deserialize};

use super::{
    Component,
    Controller,
    Video,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub id: String,
    pub is_configured: bool,
    // Set to the name of the snap to connect an external teg-marlin process to the snap's
    // tmp directory and socket. Generally this is only useful for teg-marlin development.
    pub debug_snap_name: Option<String>,
    components: Vec<Component>,
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

    pub fn heater_addresses(&self) -> Vec<String> {
        self.components
            .iter()
            .filter_map(|component| {
                match component {
                    | Component::BuildPlatform { heater: true, address }
                    | Component::Toolhead { heater: true, address } => {
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

    pub fn axis_addresses(&self) -> Vec<String> {
        self.components
            .iter()
            .filter_map(|component| {
                match component {
                    | Component::Axis { address, .. }
                    | Component::Toolhead { address, .. } => {
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

    pub fn socket_path(&self) -> String {
        let socket_dir = if let Some(snap_name) = &self.debug_snap_name {
            format!("/var/snap/{}/current/var", snap_name)
        } else {
            "/var/lib/teg".to_string()
        };

        format!("{}/machine-{}.sock", socket_dir, self.id)
    }
}
