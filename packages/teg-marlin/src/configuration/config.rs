use std::path::Path;
use serde::{Serialize, Deserialize};

use super::{
    Component,
    Controller,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub id: String,
    pub is_configured: bool,
    pub socket_dir: Option<String>,
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
    pub fn socket_path(&self) -> String {
        let socket_dir = self.socket_dir
            .as_ref()
            .map(|dir| dir.clone())
            .unwrap_or("/var/lib/teg/".to_string());

        Path::new(&socket_dir)
            .join(format!("machine-{}.sock", self.id))
            .to_str()
            .expect("Unable to build socket directory")
            .to_string()
    }
}
