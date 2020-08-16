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
pub struct SetTargetTemperaturesMacro {
    heaters: HashMap<String, f32>,
    #[serde(default)]
    sync: bool,
}

impl SetTargetTemperaturesMacro {
    // pub fn key() -> &'static str { "setTargetTemperatures" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         required: ['axes'],
    //         properties: {
    //           axes: {
    //             oneOf: [
    //               { type: 'string' },
    //               { type: 'array', contains: { type: 'string' } },
    //             ],
    //           },
    //         },
    //     })
    // }

    pub async fn compile(&self, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let config = ctx.machine_config.read().await;

        let gcodes = self.heaters.iter()
            .map(|(address, val)| {
                match config.at_address(address) {
                    // Extruder = M104
                    Some(Component::Toolhead(_)) => {
                        let extruder_index = address[1..].parse::<u32>()
                            .with_context(|| format!("Invalid extruder address: {:?}", address))?;

                        Ok(format!("M104 S{} T{}", val, extruder_index))
                    },
                    // Build Platform = M140
                    Some(Component::BuildPlatform(_)) => {
                        Ok(format!("M140 S{}", val))
                    },
                    _ => {
                        Err(anyhow!("Axis (address: {:?}) not found", address))
                    },
                }
            })
            .map(|gcode|
                gcode.map(|gcode|
                    AnnotatedGCode::GCode(gcode)
                )
            )
            .collect::<Result<Vec<AnnotatedGCode>>>()?;

        Ok(gcodes)
    }
}
