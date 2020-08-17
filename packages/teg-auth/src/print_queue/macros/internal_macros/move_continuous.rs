use std::sync::Arc;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::json;
// use serde_json::json;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use super::MoveMacro;
use super::AnnotatedGCode;

use crate::{
    // models::VersionedModel,
    // models::VersionedModelResult,
    // materials::Material,
    Context,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MoveContinuousMacro {
    pub ms: f32,
    pub feedrate_multiplier: Option<f32>,
    pub axes: HashMap<String, MoveContinuousAxis>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MoveContinuousAxis {
    pub forward: bool,
}


fn driver_macro(value: serde_json::Value) -> String {
    format!("!{}", value.to_string()).replace('\n', " ")
}

impl MoveContinuousMacro {
    // pub fn key() -> &'static str { "continuousMove" }

    // pub fn json_schema(&self) -> serde_json::Value {
    //     json!({
    //         type: 'object',
    //         required: ['ms', 'axes'],
    //         properties: {
    //           axes: {
    //             type: 'object',
    //             properties: {
    //               forward: {
    //                 type: 'boolean',
    //               },
    //             },
    //           },
    //           feedrateMultiplier: {
    //             type: 'number',
    //           },
    //         },
    //     })
    // }

    pub async fn compile(&self, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let mut directions = HashMap::<String, f32>::new();
        for (k, axis) in self.axes.iter() {
            directions.insert(k.clone(), if axis.forward { 1.0 } else { -1.0 });
        }

        let mut move_macro = MoveMacro {
            axes: directions.clone(),
            feedrate_multiplier: self.feedrate_multiplier,
            ..Default::default()
        };

        // calculate the feedrate
        let ctx_clone = Arc::clone(&ctx);
        let (_, feedrate_mm_per_s) = move_macro.g1_and_feedrate(ctx_clone).await?;

        // base move distances off the calculated feedrate
        let total_distance = feedrate_mm_per_s as f32 / 1000.0 * self.ms;

        //   ____________________
        // |/ x^2 + y^2 + z^2 ...  = total_distance
        //
        // Move an equal distance on each axis. This is a simplification - it is valid for XY movements
        // but may not hold up well for mixed extrusion/Z/XY movements.
        let axe_distance = (total_distance.powi(2) * (self.axes.iter().len() as f32)).sqrt();

        let segment_count: i32 = 3;
        move_macro.axes = directions.iter().fold(
            HashMap::new(), 
            |mut acc, (k, direction)| {
                acc.insert(k.clone(), axe_distance * direction / (segment_count as f32));
                acc
            },
        );

        // recalculate a g1 move from the distances
        let ctx_clone = Arc::clone(&ctx);
        let (g1, _) = move_macro.g1_and_feedrate(ctx_clone).await?;

        let gcodes = vec![
            "M114".to_string(),
            // record the previous target position
            driver_macro(json!({"markTargetPosition": {} })),
            // send the new movements before blocking so that the printer does not decelerate
            // between moves. Splitting the moves seems to reduce toolhead pauses.
            "G91".to_string(),
            g1.clone(),
            g1.clone(),
            g1.clone(),
            "G90".to_string(),
            // wait to reach the previous target position and then unblock
            driver_macro(json!({"waitToReachMark": { "axes": directions } })),
        ];

        let gcodes = gcodes
            .into_iter()
            .map(|gcode| AnnotatedGCode::GCode(gcode))
            .collect();

        Ok(gcodes)
    }
}
