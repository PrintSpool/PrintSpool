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
pub struct SetTargetTemperaturesMacro {
    pub heaters: HashMap<String, f32>,
    #[serde(default)]
    pub sync: bool,
}

/// example useage:
/// { setTargetTemperature: { heaters: { e0: 220 }, sync: true } }
impl SetTargetTemperaturesMacro {
    // pub fn key() -> &'static str { "setTargetTemperatures" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         required: ['heaters'],
    //         properties: {
    //           heaters: {
    //             type: 'object',
    //             additionalProperties: {
    //               type: 'number',
    //             },
    //           },
    //           sync: {
    //             type: 'boolean',
    //           },
    //         },
    //     })
    // }

    pub async fn compile(&self, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let mut gcodes = self.heaters.iter()
            .map(|(address, val)| {
                // Extruder = M104
                if let Some(_toolhead) = config.toolheads
                    .iter()
                    .find(|c| &c.model.address == address)
                {
                    let extruder_index = address[1..].parse::<u32>()
                        .with_context(|| format!("Invalid extruder address: {:?}", address))?;

                    Ok(format!("M104 S{} T{}", val, extruder_index))
                }
                // Build Platform = M140
                else if config.build_platforms
                    .iter()
                    .find(|c| &c.model.address == address)
                    .is_some()
                {
                    Ok(format!("M140 S{}", val))
                } else {
                    Err(eyre!("Heater (address: {:?}) not found", address))
                }
            })
            .map(|gcode|
                gcode.map(AnnotatedGCode::GCode)
            )
            .collect::<Result<Vec<AnnotatedGCode>>>()?;

        if self.sync {
            gcodes.push(AnnotatedGCode::GCode("M109".to_string()))
        }

        Ok(gcodes)
    }
}
