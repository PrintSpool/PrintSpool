use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use eyre::{
    eyre,
    Result,
    Context as _,
};
use printspool_machine::config::MachineConfig;
use crate::AnnotatedGCode;

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

    pub async fn compile(&self, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let gcodes = self.fans.iter()
            .map(|(address, enable)| {
                if config.speed_controllers
                    .iter()
                    .any(|c| &c.model.address == address)
                {
                    let mcode = if *enable { "M106" } else { "M107" };

                    let fan_index = address[1..].parse::<u32>()
                        .with_context(|| format!("Invalid fan address: {:?}", address))?;

                    Ok(format!("{} P{}", mcode, fan_index))
                } else {
                    Err(eyre!("Fan (address: {:?}) not found", address))
                }
            })
            .map(|gcode|
                gcode.map(AnnotatedGCode::GCode)
            )
            .collect::<Result<Vec<AnnotatedGCode>>>()?;

        Ok(gcodes)
    }
}
