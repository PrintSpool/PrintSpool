use std::sync::Arc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
// use serde_json::json;
use anyhow::{
    anyhow,
    Result,
    Context as _,
};

use super::AnnotatedGCode;

use crate::{
    Context,
    configuration::Component,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToggleFansMacro {
    pub fans: HashMap<String, bool>,
}

impl ToggleFansMacro {
    // pub fn key() -> &'static str { "setTargetTemperatures" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         properties: {
    //           fans: {
    //             type: 'object',
    //             additionalProperties: {
    //               type: 'boolean',
    //             },
    //           },
    //         },
    //     })
    // }

    pub async fn compile(&self, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let config = ctx.machine_config.read().await;

        let gcodes = self.fans.iter()
            .map(|(address, enable)| {
                match config.at_address(address) {
                    Some(Component::Fan(_)) => {
                        let mcode = if *enable { "M106" } else { "M107" };

                        let fan_index = address[1..].parse::<u32>()
                            .with_context(|| format!("Invalid fan address: {:?}", address))?;

                        Ok(format!("{} P{}", mcode, fan_index))
                    },
                    _ => {
                        Err(anyhow!("Fan (address: {:?}) not found", address))
                    },
                }
            })
            .map(|gcode|
                gcode.map(AnnotatedGCode::GCode)
            )
            .collect::<Result<Vec<AnnotatedGCode>>>()?;

        Ok(gcodes)
    }
}
