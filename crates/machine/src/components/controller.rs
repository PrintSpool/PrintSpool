use serde::{Deserialize, Serialize};
use schemars::JsonSchema;

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
#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ControllerConfig {
    /// # Name
    // TODO: validate: #[schemars(min_length = 1)]
    pub name: String,

    /// # Serial Port
    // TODO: validate: #[schemars(min_length = 1)]
    #[serde(rename = "serialPortID")]
    pub serial_port_id: String,

    /// # Automatic Baud Rate Detection
    pub automatic_baud_rate_detection: bool,
    /// # Baud Rate
    pub baud_rate: BaudRate,

    /// # Simulate Attached Controller
    pub simulate: bool,
    /// # Await greeting from firmware
    pub await_greeting_from_firmware: bool,
    /// # Number of GCodes sent and responses received to keep buffered on the machine service
    pub gcode_history_buffer_size: usize,

    // delays

    /// # Serial connnection timeout (ms)
    /// # Delay from greeting to ready (ms)
    pub delay_from_greeting_to_ready: u64,
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
    pub checksum_tickles: bool,
}

pub type Controller = ComponentInner<ControllerConfig, ()>;

#[derive(Serialize, Deserialize, JsonSchema, Debug, Copy, Clone)]
pub enum BaudRate {
    // #[serde(rename = "250000")]
    Baud250K = 250_000,
    // #[serde(rename = "230400")]
    Baud230K = 230_400,
    // #[serde(rename = "115200")]
    Baud115K = 115_200,
    // #[serde(rename = "57600")]
    Baud057K = 57_600,
    // #[serde(rename = "38400")]
    Baud038K = 38_400,
    // #[serde(rename = "19200")]
    Baud019K = 19_200,
    // #[serde(rename = "9600")]
    Baud009K = 9_600,
}
