use serde::{Deserialize, Serialize};
use schemars::JsonSchema;
use validator::Validate;
// use regex::Regex;

use super::ComponentInner;

// TODO: Previously these configs were include in the machine config for onboarding:
// - 'serialPortID',
// - 'automaticBaudRateDetection',
// - 'baudRate',
// impl MachineForm for ControllerConfig {
//     fn machine_form() -> Vec<&'static str> {
//         vec![
//             "serialPortID",
//             "automaticBaudRateDetection",
//             "baudRate",
//         ]
//     }
// }

/// # Controller
#[derive(Serialize, Deserialize, JsonSchema, Validate, Default, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ControllerConfig {
    /// # Name
    #[validate(length(min = 1, message = "Name cannot be blank"))]
    pub name: String,

    /// # Serial Port
    #[validate(length(min = 1, message = "Serial port id cannot be blank"))]
    #[serde(rename = "serialPortID")]
    pub serial_port_id: String,

    /// # Automatic Baud Rate Detection
    #[serde(default)]
    pub automatic_baud_rate_detection: bool,
    /// # Baud Rate
    pub baud_rate: BaudRate,

    /// # Simulate Attached Controller
    #[serde(default)]
    pub simulate: bool,
    /// # Number of GCodes sent and responses received to keep buffered on the machine service
    pub gcode_history_buffer_size: usize,

    // delays

    /// # Temperature polling interval (ms)
    pub polling_interval: u64,
    /// # Fast code timeout (ms)
    pub fast_code_timeout: u64,
    /// # Long running code timeout (ms)
    pub long_running_code_timeout: u64,
    /// The number of milliseconds to wait for a response for each baudrate when attempting
    /// automatic baudrate detection.
    pub serial_connection_timeout: u64,

    /// # Response timeout tickle attempts
    pub response_timeout_tickle_attempts: u32,
    /// # Long Running GCodes
    pub long_running_codes: Vec<String>,
    /// # Blocking GCodes
    pub blocking_codes: Vec<String>,
    /// # Send checksums with response timeout tickle attempts
    #[serde(default)]
    pub checksum_tickles: bool,
}

impl teg_config_form::Model for ControllerConfig {
    fn static_form() -> Option<Vec<&'static str>> {
        Some(vec![
            "name",
            "serialPortID",
            "automaticBaudRateDetection",
            "baudRate",
        ])
    }

    fn static_advanced_form() -> Option<Vec<&'static str>> {
        Some(vec![
        ])
    }
}

pub type Controller = ComponentInner<ControllerConfig, ()>;

#[derive(Serialize, Deserialize, JsonSchema, Debug, Copy, Clone)]
pub enum BaudRate {
    #[serde(rename = "250000")]
    Baud250K,
    #[serde(rename = "230400")]
    Baud230K,
    #[serde(rename = "115200")]
    Baud115K,
    #[serde(rename = "57600")]
    Baud057K,
    #[serde(rename = "38400")]
    Baud038K,
    #[serde(rename = "19200")]
    Baud019K,
    #[serde(rename = "9600")]
    Baud009K,
}

impl Default for BaudRate {
    fn default() -> Self { BaudRate::Baud115K }
}

impl BaudRate {
    pub fn to_u32(&self) -> u32 {
        use BaudRate::*;
        match self {
            Baud250K => 250_000,
            Baud230K => 230_400,
            Baud115K => 115_200,
            Baud057K => 57_600,
            Baud038K => 38_400,
            Baud019K => 19_200,
            Baud009K => 9_600,
        }
    }
}
