use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use serde_json::json;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use teg_machine::config::MachineConfig;
use crate::AnnotatedGCode;
use super::MoveMacro;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MoveContinuousMacro {
    pub ms: f32,
    pub feedrate: Option<f32>,
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

    pub async fn compile(&self, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let mut directions = HashMap::<String, f32>::new();
        for (k, axis) in self.axes.iter() {
            directions.insert(k.clone(), if axis.forward { 1.0 } else { -1.0 });
        }

        let mut move_macro = MoveMacro {
            axes: directions.clone(),
            feedrate_multiplier: self.feedrate_multiplier,
            feedrate: self.feedrate,
            allow_extruder_axes: true,
            relative_movement: true,
            ..Default::default()
        };

        // calculate the feedrate
        let (_, feedrate_mm_per_min, _) = move_macro.g1_and_feedrate(&config).await?;

        // base move distances off the calculated feedrate
        let total_distance = feedrate_mm_per_min as f32 * self.ms / 60_000.0;

        //   ____________________
        // |/ x^2 + y^2 + z^2 ...  = total_distance
        //
        // Move an equal distance on each axis. This is a simplification - it is valid for XY
        // movements but may not hold up well for mixed extrusion/Z/XY movements.
        let axe_distance = (total_distance.powi(2) * (self.axes.iter().len() as f32)).sqrt();

        let segment_count: i32 = 3;

        // Modify the move_macro distances
        move_macro.axes = directions.iter().fold(
            HashMap::new(),
            |mut acc, (k, direction)| {
                acc.insert(k.clone(), axe_distance * direction / (segment_count as f32));
                acc
            },
        );

        // recalculate a g1 move from the distances
        let (
            g1,
            _,
            feedrates,
        ) = move_macro.g1_and_feedrate(&config).await?;

        // applying reverse direction configs
        let mut mark_axes = self.axes.clone();
        for axis in mark_axes.iter_mut() {
            let feedrate_info = feedrates.iter()
                .find(|f| &f.address == axis.0)
                .ok_or_else(||
                    anyhow!("Invaraint: Continuous move axis not found in feedrates list")
                )?;

            if feedrate_info.reverse_direction {
                axis.1.forward = !axis.1.forward
            };
        };

        let gcodes = if feedrates.iter().all(|f| !f.is_toolhead) {
            info!("CARTESIAN CONTINUOUS MOVE");
            // Non toolheads can use wait to reach mark for reduced move stuttering
            vec![
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
                driver_macro(json!({"waitToReachMark": { "axes": mark_axes } })),
            ]
        } else {
            info!("CONTINUOUS EXTRUDE");
            // Toolheads lack position feedback so we fallback to M400 (finish moves) which
            // introduces some necessary move stuterring.
            //
            // See: https://github.com/MarlinFirmware/Marlin/issues/19190
            // And: https://marlinfw.org/docs/gcode/M400.html
            vec![
                "G91".to_string(),
                // block on the previous move
                "M400".to_string(),
                // Do the move as non-blocking to compensate for the latency between
                // this task ending and the next one being received
                g1.clone(),
                g1.clone(),
                g1.clone(),
                "G90".to_string(),
            ]
        };

        let gcodes = gcodes
            .into_iter()
            .map(|gcode| AnnotatedGCode::GCode(gcode))
            .collect();

        Ok(gcodes)
    }
}
