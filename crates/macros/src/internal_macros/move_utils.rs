use std::collections::HashMap;
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use teg_machine::config::{Feedrate, MachineConfig};
use crate::AnnotatedGCode;

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
        config: &MachineConfig,
        axes: Vec<String>,
        allow_extruder_axes: bool,
    ) -> Result<Vec<Feedrate>> {
        let feedrates: Vec<Feedrate> = config.feedrates();

        axes.iter().map(move |address| {
            let axis = feedrates.iter().find(|a| a.address == *address)
                .ok_or_else(|| eyre!("Axis not found: {}", address))?;

            if !allow_extruder_axes && axis.is_toolhead {
                Err(eyre!("Cannot extrude when allow_extruder_axes = true"))
            } else {
                Ok(axis.clone())
            }
        }).collect()
    }

    pub async fn compile(&self, config: &MachineConfig) -> Result<Vec<AnnotatedGCode>> {
        let (g1, feedrate, _) = self.g1_and_feedrate(&config).await?;

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

    pub async fn g1_and_feedrate(&self, config: &MachineConfig) -> Result<(String, f32, Vec<Feedrate>)> {
        if let Some(feedrate) = self.feedrate {
            if feedrate < 0.0 {
                Err(eyre!("feedrate must be greater then zero if set. Got: {}", feedrate))?;
            }
        }

        let feedrates = Self::get_feedrates(
            &config,
            self.axes.keys().map(|k| k.clone()).collect(),
            self.allow_extruder_axes,
        )
            .await?;

        let mut g1_args = vec![];
        for feedrate_info in feedrates.iter() {
            // TODO: does this work with multi-extruder printers?
            let address = if feedrate_info.is_toolhead {
                "E".to_string()
            } else {
                feedrate_info.address.to_ascii_uppercase()
            };

            let reverse = self.relative_movement && feedrate_info.reverse_direction;
            let direction_sign = if reverse {
                -1.0
            } else {
                1.0
            };

            let distance = self.axes.get(&feedrate_info.address)
                .ok_or_else(||
                    eyre!(
                        "Invariant: address ({:?}) not found in self.axes",
                        feedrate_info.address,
                    )
                )?;

            g1_args.push(format!("{}{}", address, direction_sign * distance));
        }

        let feedrate = if let Some(feedrate) = self.feedrate {
            feedrate
        } else {
            feedrates.iter()
                // f32 cannot be compared so compare i64s
                .min_by_key(|target| (target.feedrate * 1_000_000.0).round() as i64)
                .ok_or_else(|| eyre!("Expected at least one axis in move macro"))?
                .feedrate
        };

        // MM per Minute to MM per Second conversion
        let feedrate = feedrate * 60.0 * self.feedrate_multiplier.unwrap_or(1.0);

        let gcode = format!("G1 {} F{}", g1_args.join(" "), feedrate);

        Ok((
            gcode,
            feedrate,
            feedrates,
        ))
    }
}
