use std::sync::Arc;
use futures::prelude::*;
// use std::collections::HashMap;
// use chrono::prelude::*;
use async_graphql::*;
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

#[path = "internal_macros/set_materials.rs"]
mod set_materials;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")] 
enum InternalMacro {
    SetMaterials(set_materials::SetMaterialsMacro),
}

// enum GCodeOrAnnotation {
//     GCode(String)
//     Annotation(TaskAnnotation)
// }
pub enum AnnotatedGCode {
    GCode(String),
    Annotation((u64, GCodeAnnotation)),
}

impl InternalMacro {
    pub async fn compile(line: &str, ctx: Arc<Context>) -> Result<Vec<AnnotatedGCode>> {
        // handle internal macro
        let internal_macro: InternalMacro = serde_json::from_str(&line)
            .with_context(|| format!("Invalid JSON GCode: {:?}", line))?;

        match internal_macro {
            InternalMacro::SetMaterials(m) => m.compile(ctx).await
        }
    }
}

pub fn compile_macros<'a>(
    ctx: Arc<Context>,
    gcode_lines: impl IntoIterator<Item = String>
) -> impl TryStream<Ok = AnnotatedGCode, Error = anyhow::Error> {
    let gcode_lines = gcode_lines.into_iter();

    stream::iter(gcode_lines)
        // Process macros and generate annotations
        .scan(ctx, move |ctx, line| {
            let ctx = Arc::clone(ctx);
            async move {
                let line = line.clone();
                let is_json = line.chars().next() == Some('{');

                let result = if is_json {
                    // handle internal macro
                    InternalMacro::compile(&line, ctx).await
                    // handle JSON formatted GCode
                } else {
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
