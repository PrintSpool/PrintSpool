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
pub struct MoveByMacro {
    /// Relative move distances keyed by axis addresses
    pub distances: HashMap<String, f32>,
    #[serde(default)]
    pub feedrate: Option<f32>,
    #[serde(default)]
    pub feedrate_multiplier: Option<f32>,
    #[serde(default)]
    pub sync: bool,
    #[serde(default)]
    pub use_visual_axes_transform: bool,
}

impl MoveByMacro {
    // pub fn key() -> &'static str { "moveBy" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         required: ['distances'],
    //         properties: {
    //           distances: {
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


    /// example useage: { moveBy: { distances: { [id]: 100 } } }
    pub async fn compile(&self, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let move_macro = MoveMacro {
            axes: self.distances.clone(),
            feedrate: self.feedrate,
            feedrate_multiplier: self.feedrate_multiplier,
            sync: self.sync,
            allow_extruder_axes: true,
            relative_movement: true,
            use_visual_axes_transform: self.use_visual_axes_transform,
        };

        move_macro.compile(config).await
    }
}
