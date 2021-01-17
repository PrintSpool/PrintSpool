use std::sync::Arc;
use serde::{Deserialize, Serialize};
// use serde_json::json;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::AnnotatedGCode;

use crate::{
    Context,
};

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

    pub async fn compile(&self, _ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let gcode = if self.enable { "M17" } else { "M18" };
        let gcode = AnnotatedGCode::GCode(gcode.to_string());

        Ok(vec![gcode])
    }
}
