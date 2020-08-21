use std::sync::Arc;
use std::collections::HashMap;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::{
    Context,
    configuration::Feedrate,
};

use super::AnnotatedGCode;

#[derive(Clone, Debug, Default)]
pub struct MoveMacro {
    pub axes: HashMap<String, f32>,
    pub feedrate: Option<f32>,
    pub feedrate_multiplier: Option<f32>,
    pub sync: bool,
    pub allow_extruder_axes: bool,
    pub relative_movement: bool,
}

impl MoveMacro {
    pub async fn get_feedrates(
        ctx: Arc<Context>,
        axes: Vec<String>,
        allow_extruder_axes: bool,
    ) -> Result<Vec<Feedrate>> {
        let config = ctx.machine_config.load();
        let feedrates: Vec<Feedrate> = config.feedrates().collect();

        axes.iter().map(move |address| {
            let axis = feedrates.iter().find(|a| a.address == *address)
                .ok_or_else(|| anyhow!("Axis not found: {}", address))?;

            if !allow_extruder_axes && axis.is_toolhead {
                Err(anyhow!("Cannot extrude when allow_extruder_axes = true"))
            } else {
                Ok(axis.clone())
            }
        }).collect()
    }

    pub async fn compile(&self, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        let (g1, feedrate) = self.g1_and_feedrate(ctx).await?;

        let mut gcodes = vec![
            (if self.relative_movement { "G91" } else { "G90" }).to_string(),
            format!("G1 F{}", feedrate),
            g1,
            "G90".to_string(),
        ];

        /*
        * Synchronize the end of the task with M400 by waiting until all
        * scheduled movements in the task are finished.
        */
        if self.sync {
            gcodes.push("M400".to_string())
        }

        let gcodes = gcodes
            .into_iter()
            .map(|gcode| AnnotatedGCode::GCode(gcode))
            .collect();

        Ok(gcodes)
    }

    pub async fn g1_and_feedrate(&self, ctx: Arc<Context>) -> Result<(String, f32)> {
        if let Some(feedrate) = self.feedrate {
            if feedrate < 0.0 {
                Err(anyhow!("feedrate must be greater then zero if set. Got: {}", feedrate))?;
            }
        }

        let feedrates = Self::get_feedrates(
            Arc::clone(&ctx),
            self.axes.keys().map(|k| k.clone()).collect(),
            self.allow_extruder_axes,
        )
            .await?;

        let mut g1_args = vec![];
        for axis in feedrates.iter() {
            // TODO: does this work with multi-extruder printers?
            let address = if axis.is_toolhead {
                axis.address.clone()
            } else {
                "e".to_string()
            };

            let distance = self.axes.get(&axis.address)
                .ok_or_else(||
                    anyhow!("Invariant: address ({:?}) not found in self.axes", axis.address)
                )?;

            g1_args.push(format!("{}{}", address.to_ascii_uppercase(), distance));
        }

        let feedrate = if let Some(feedrate) = self.feedrate {
            feedrate
        } else {
            let min_feedrate_axis = feedrates.iter()
                // f32 cannot be compared so compare i64s
                .min_by_key(|target| (target.feedrate * 1_000_000.0).round() as i64)
                .ok_or_else(|| anyhow!("Expected at least one axis in move macro"))?;

            *self.axes.get(&min_feedrate_axis.address)
                .expect("Invariant: address should exist in both axes and self.axes")
        };

        // MM per Minute to MM per Second conversion
        let feedrate = feedrate * 60.0 * self.feedrate_multiplier.unwrap_or(1.0);

        let gcode = format!("G1 {} F{}", g1_args.join(" "), feedrate);

        Ok((
            gcode,
            feedrate,
        ))
    }
}
