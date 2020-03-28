use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Controller {
    #[serde(rename = "serialPortID")]
    pub serial_port_id: String,

    pub automatic_baud_rate_detection: bool,
    pub baud_rate: u32,

    pub simulate: bool,
    pub await_greeting_from_firmware: bool,
    pub gcode_history_buffer_size: usize,

    // delays
    pub delay_from_greeting_to_ready: u64,
    pub polling_interval: u64,
    pub fast_code_timeout: u64,
    pub long_running_code_timeout: u64,

    pub response_timeout_tickle_attempts: u32,
    pub long_running_codes: Vec<String>,
    pub blocking_codes: Vec<String>,
    pub checksum_tickles: bool,
}


#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type", content = "model")]
pub enum Component {
    #[serde(rename = "CONTROLLER")]
    Controller(Controller),
    #[serde(rename = "AXIS", rename_all = "camelCase")]
    Axis {
        address: String,
    },
    #[serde(rename = "TOOLHEAD", rename_all = "camelCase")]
    Toolhead {
        address: String,
        heater: bool,
    },
    #[serde(rename = "FAN", rename_all = "camelCase")]
    Fan {
        address: String,
    },
    #[serde(rename = "BUILD_PLATFORM", rename_all = "camelCase")]
    BuildPlatform {
        address: String,
        heater: bool,
    }
}
