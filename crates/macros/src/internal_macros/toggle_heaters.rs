use std::collections::HashMap;
use future::join_all;
use futures::prelude::*;
use serde::{Deserialize, Serialize};
use eyre::{
    eyre,
    Result,
    Context as _,
};
use teg_machine::config::MachineConfig;
use teg_material::{
    Material,
    MaterialConfigEnum::FdmFilament,
};
use teg_json_store::Record;

use crate::AnnotatedGCode;
use super::SetTargetTemperaturesMacro;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ToggleHeatersMacro {
    pub heaters: HashMap<String, bool>,
    #[serde(default)]
    pub sync: bool,
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

    pub async fn compile(&self, db: &crate::Db, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let heaters = self.heaters.iter()
            .map(|(address, enable)| async move {
                // set the extruder temperature
                if let Some(toolhead) = config.toolheads
                    .iter()
                    .find(|c| &c.model.address == address)
                {
                    if !enable {
                        return Ok((address.clone(), 0.0))
                    }

                    let material_id = toolhead.model.material_id
                        .as_ref()
                        .ok_or_else(|| eyre!("No material loaded for {}", address))?;

                    let material = Material::get(db, &material_id)
                        .await
                        .with_context(||
                            format!("Unable to find material (id: {:?})", material_id)
                        )?;

                    let target = match material.config {
                        FdmFilament(fdm) => fdm.target_extruder_temperature,
                    };

                    Ok((address.clone(), target))
                // set the bed temperature to the lowest of the materials loaded
                //
                // TODO: Is this the expected behaviour for multi-extruder?
                } else if config.build_platforms
                    .iter()
                    .any(|c| &c.model.address == address)
                {
                    if !enable {
                        return Ok((address.clone(), 0.0))
                    }

                    let toolhead_materials = config.toolheads
                        .iter()
                        .map(|toolhead| async move {
                            let material_id = toolhead.model.material_id.as_ref()?;
                            let material = Material::get(db, &material_id).await;
                            Some(material)
                        });

                    let target_bed_temperatures = join_all(toolhead_materials)
                        .await
                        .into_iter()
                        .filter_map(std::convert::identity)
                        .collect::<Result<Vec<Material>>>()
                        .with_context(||
                            format!("Unable to find toolhead material")
                        )?
                        .into_iter()
                        .map(|material| {
                            match material.config {
                                FdmFilament(fdm) => fdm.target_bed_temperature,
                            }
                        });

                    // let target = match material.config {
                    //     FdmFilament(fdm) => fdm.target_bed_temperature,
                    // };

                    let target = target_bed_temperatures
                        // f32 cannot be compared so compare i64s
                        .min_by_key(|target| (target * 1_000_000.0).round() as i64)
                        .ok_or_else(||eyre!("Materials must be set before toggling heaters"))?;

                    Ok((address.clone(), target as f32))
                } else {
                    Err(eyre!("Heater not found (address: {:?})", address))
                }
            });

        let heaters = join_all(heaters)
            .await
            .into_iter()
            .collect::<Result<HashMap<String, f32>>>()?;

        SetTargetTemperaturesMacro {
            heaters,
            sync: self.sync,
        }.compile(&config).await
    }
}
