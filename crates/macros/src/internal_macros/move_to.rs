use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_machine::config::MachineConfig;
use crate::AnnotatedGCode;
use super::MoveMacro;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MoveToMacro {
    pub positions: HashMap<String, f32>,
    #[serde(default)]
    pub feedrate: Option<f32>,
    #[serde(default)]
    pub feedrate_multiplier: Option<f32>,
    #[serde(default)]
    pub sync: bool,
    #[serde(default)]
    pub use_visual_axes_transform: bool,
}

impl MoveToMacro {
    // pub fn key() -> &'static str { "moveBy" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         required: ['position'],
    //         properties: {
    //           positions: {
    //             type: 'object',
    //             additionalProperties: { type: 'number' },
    //           },
    //           feedrate: {
    //             type: 'number',
    //           },
    //           sync: {
    //             type: 'boolean',
    //           },
    //         },
    //     })
    // }

    /// example useage: { moveTo: { positions: { [id]: 100 } } }
    pub async fn compile(&self, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let move_macro = MoveMacro {
            axes: self.positions.clone(),
            feedrate: self.feedrate,
            feedrate_multiplier: self.feedrate_multiplier,
            sync: self.sync,
            allow_extruder_axes: false,
            relative_movement: false,
            use_visual_axes_transform: self.use_visual_axes_transform,
        };

        move_macro.compile(&config).await
    }
}
