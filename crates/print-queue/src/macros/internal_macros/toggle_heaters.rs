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
use super::SetTargetTemperaturesMacro;

use crate::{
    Context,
    configuration::Component,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToggleHeatersMacro {
    pub heaters: HashMap<String, bool>,
    #[serde(default)]
    pub sync: bool,
}

fn find_material<'a>(host_config: &'a toml::Value, material_id: &String) -> Option<toml::Value> {
    dbg!(&host_config["materials"]);
    host_config["materials"]
        .as_array()
        .unwrap_or(&vec![])
        .into_iter()
        .find(|material| {
            dbg!(&material["id"], toml::Value::String(material_id.clone()));
            material["id"] == toml::Value::String(material_id.clone())
        })
        .map(|material| material.clone())
}

impl ToggleHeatersMacro {
    // pub fn key() -> &'static str { "toggleHeaters" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         required: ['heaters'],
    //         properties: {
    //           heaters: {
    //             type: 'object',
    //             additionalProperties: {
    //               type: 'boolean',
    //             },
    //           },
    //           sync: {
    //             type: 'boolean',
    //           },
    //         },
    //     })
    // }

    pub async fn compile(&self, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let ctx_clone = Arc::clone(&ctx);
        let config = ctx_clone.machine_config.load();

        let host_config = std::fs::read_to_string(
            "/etc/teg/combinator.toml",
        )?;
        let host_config: toml::Value = toml::from_str(&host_config)?;

        let heaters = self.heaters.iter()
            .map(|(address, enable)| {
                if !enable {
                    return Ok((address.clone(), 0.0))
                }

                // set the extruder temperature
                if let Some(toolhead) = config.toolheads.find(|c| c.address == address) {
                    let material_id = toolhead.material_id.clone();

                    let target = find_material(&host_config, &material_id)
                        .map(|material|
                            material["model"]["targetExtruderTemperature"]
                                .clone()
                                .try_into::<f32>()
                        )
                        .with_context(||
                            format!("Unable to find material (id: {:?})", material_id)
                        )?
                        .with_context(||
                            format!("Invalid material target temp (id: {:?})", material_id)
                        )?;

                    Ok((address.clone(), target as f32))
                // set the bed temperature to the lowest of the materials loaded
                //
                // TODO: Is this the expected behaviour for multi-extruder?
                } else if config.build_platform.iter().any(|c| c.address == address) {
                    let target = config.toolheads()
                        .map(|toolhead| {
                            let material_id = toolhead.material_id.clone();

                            find_material(&host_config, &material_id)
                                .map(|material|
                                    material["model"]["targetBedTemperature"]
                                        .clone()
                                        .try_into::<f64>()
                                )
                                .with_context(||
                                    format!("Unable to find material (id: {:?})", material_id)
                                )?
                                .with_context(||
                                    format!("Invalid material target temp (id: {:?})", material_id)
                                )
                        })
                        .collect::<Result<Vec<f64>>>()?
                        .into_iter()
                        // f32 cannot be compared so compare i64s
                        .min_by_key(|target| (target * 1_000_000.0).round() as i64)
                        .ok_or_else(||anyhow!("Materials must be set before toggling heaters"))?;

                    Ok((address.clone(), target as f32))
                } else {
                    Err(anyhow!("Heater not found (address: {:?})", address))
                }
            })
            .collect::<Result<HashMap<String, f32>>>()?;

        SetTargetTemperaturesMacro {
            heaters,
            sync: self.sync,
        }.compile(ctx).await
    }
}
