use serde::{Deserialize, Serialize};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use printspool_machine::config::MachineConfig;
use crate::AnnotatedGCode;

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

    pub async fn compile(&self, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let mut gcode_words = vec!["G28".to_string()];

        let mut gcode_args = match self.axes.clone() {
            HomeAxes::All(all) if &all == "all" => {
                vec![]
            },
            HomeAxes::Axes(macro_axes) => {
                // Verify that each axis from the input exists in the machine config
                for address in macro_axes.iter() {
                    config.axes
                        .iter()
                        .find(|c| &c.model.address == address)
                        .ok_or_else(|| eyre!("Axis (address: {:?}) not found", address))?;
                }

                macro_axes.into_iter()
                    .map(|axis| axis.to_ascii_uppercase())
                    .collect()
            },
            _ => {
                Err(eyre!("axes must either be an array or axis names or {all: true}"))?
            }
        };

        gcode_words.append(&mut gcode_args);

        let gcode = AnnotatedGCode::GCode(
            gcode_words.join(" ")
        );

        Ok(vec![gcode])
    }
}
