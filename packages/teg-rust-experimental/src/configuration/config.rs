use serde::{Serialize, Deserialize};

use super::{
    Component,
    Controller,
};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    pub is_configured: bool,
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
}