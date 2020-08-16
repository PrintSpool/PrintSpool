use std::sync::Arc;
use futures::prelude::*;
// use std::collections::HashMap;
// use chrono::prelude::*;
// use async_graphql::ID;
use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};
// use async_graphql::ID;

// use crate::models::VersionedModel;
use crate::{
    print_queue::tasks::{
        GCodeAnnotation,
    },
    Context,
};

mod json_gcode;
pub use json_gcode::JsonGCode;

#[path = "internal_macros/set_materials.rs"]
mod set_materials;
use set_materials::SetMaterialsMacro;

#[path = "internal_macros/move_by.rs"]
mod move_by;
use move_by::MoveByMacro;

#[path = "internal_macros/move_to.rs"]
mod move_to;
use move_to::MoveToMacro;

#[path = "internal_macros/move_utils.rs"]
mod move_utils;

use move_utils::MoveMacro;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] 
pub enum InternalMacro {
    SetMaterials(SetMaterialsMacro),
    MoveBy(MoveByMacro),
    MoveTo(MoveToMacro),
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum AnyMacro {
    InternalMacro(InternalMacro),
    JsonGCode(JsonGCode),
}

pub enum AnnotatedGCode {
    GCode(String),
    Annotation((u64, GCodeAnnotation)),
}

impl AnyMacro {
    pub async fn compile(line: &str, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        // handle internal macro
        let parsed_line: AnyMacro = serde_json::from_str(&line)
            .with_context(|| format!("Invalid JSON GCode: {:?}", line))?;

        match parsed_line {
            AnyMacro::InternalMacro(internal_macro) => {
                match internal_macro {
                    InternalMacro::SetMaterials(m) => m.compile(ctx).await,
                    InternalMacro::MoveBy(m) => m.compile(ctx).await,
                    InternalMacro::MoveTo(m) => m.compile(ctx).await,
                }
            }
            AnyMacro::JsonGCode(json_gcode) => {
                let gcode = json_gcode.try_to_string(line)?;
                Ok(vec![AnnotatedGCode::GCode(gcode)])
            }
        }
    }
}

pub fn compile_macros<'a>(
    ctx: Arc<Context>,
    gcode_lines: impl Stream<Item = std::io::Result<String>>
) -> impl TryStream<Ok = AnnotatedGCode, Error = anyhow::Error> {
    gcode_lines
        // Process macros and generate annotations
        .scan(ctx, move |ctx, line| {
            let ctx = Arc::clone(ctx);
            async move {
                let line = line
                    .with_context(|| "Error reading gcodes");
                let line = match line {
                    Ok(line) => line.clone(),
                    Err(err) => return Some(Err(err)),
                };
                let is_json = line.chars().next() == Some('{');

                let result = if is_json {
                    // handle internal macros and JSON formatted GCodes
                    AnyMacro::compile(&line, ctx).await
                } else {
                    // handle internal string GCodes lines
                    Ok(vec![AnnotatedGCode::GCode(line)])
                };

                Some(result)
            }
        })
        // Flatten the resulting gcodes and annotations
        .map_ok(|annotated_gcodes| {
            stream::iter(annotated_gcodes).map(|item| -> Result<AnnotatedGCode> {
                Ok(item)
            })
        })
        .try_flatten()
        // Add line numbers to annotations
        .scan(0, |next_line_number, item| {
            let result = match item {
                item @ Ok(AnnotatedGCode::GCode(_)) => {
                    *next_line_number += 1;
                    item
                },
                Ok(AnnotatedGCode::Annotation((_, annotation))) => {
                    Ok(AnnotatedGCode::Annotation(
                        (next_line_number.clone(), annotation)
                    ))
                },
                Err(err) => Err(err),
            };

            future::ready(Some(result))
        })
}
