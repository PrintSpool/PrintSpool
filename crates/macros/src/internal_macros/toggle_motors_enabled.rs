use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
use teg_machine::config::MachineConfig;
use crate::AnnotatedGCode;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToggleMotorsEnabledMacro {
    pub enable: bool,
}

impl ToggleMotorsEnabledMacro {
    // pub fn key() -> &'static str { "toggleMotorsEnabled" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         properties: {
    //           enabled: {
    //             type: 'boolean',
    //           },
    //         },
    //     })
    // }

    pub async fn compile(&self, _config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let gcode = if self.enable { "M17" } else { "M18" };
        let gcode = AnnotatedGCode::GCode(gcode.to_string());

        Ok(vec![gcode])
    }
}
