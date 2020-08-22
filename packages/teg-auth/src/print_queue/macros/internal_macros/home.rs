use std::sync::Arc;
use serde::{Deserialize, Serialize};
// use serde_json::json;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use super::AnnotatedGCode;

use crate::{
    // models::VersionedModel,
    // models::VersionedModelResult,
    // materials::Material,
    Context,
    configuration::Component,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct HomeMacro {
    pub axes: HomeAxes,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum HomeAxes {
    All(String),
    Axes(Vec<String>),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MoveContinuousAxis {
    pub forward: bool,
}

impl HomeMacro {
    // pub fn key() -> &'static str { "home" }

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
        let config = ctx.machine_config.load();

        let mut gcode_words = vec!["G28".to_string()];

        let mut gcode_args = match self.axes.clone() {
            HomeAxes::All(all) if &all == "all" => {
                vec![]
            },
            HomeAxes::Axes(axes) => {
                // Verify that each axis from the input exists in the machine config
                for address in axes.iter() {
                    match config.at_address(address) {
                        Some(Component::Axis(_)) => Ok(()),
                        _ => Err(anyhow!("Axis (address: {:?}) not found", address)),
                    }?;
                }

                axes.into_iter()
                    .map(|axis| axis.to_ascii_uppercase())
                    .collect()
            },
            _ => {
                Err(anyhow!("axes must either be an array or axis names or {all: true}"))?
            }
        };

        gcode_words.append(&mut gcode_args);

        let gcode = AnnotatedGCode::GCode(
            gcode_words.join(" ")
        );

        Ok(vec![gcode])
    }
}
