#[macro_use] extern crate tracing;

use serde::{Deserialize, Serialize};
use futures::prelude::*;
use eyre::{
    // eyre,
    Result,
    Context as _,
};
use teg_machine::machine::Machine;

// Re-export
pub use teg_machine::task::GCodeAnnotation;

mod internal_macros;
pub use internal_macros::InternalMacro;

mod json_gcode;
pub use json_gcode::JsonGCode;

mod compile_internal_macro;
use compile_internal_macro::CompileInternalMacro;

pub type Db = sqlx::sqlite::SqlitePool;
pub type DbId = teg_json_store::DbId;

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
    pub async fn compile(line: &str, machine: &xactor::Addr<Machine>) -> Result<Vec<AnnotatedGCode>> {
        // handle internal macro
        let parsed_line: AnyMacro = serde_json::from_str(&line)
            .with_context(|| format!("Invalid JSON GCode: {:?}", line))?;

        match parsed_line {
            AnyMacro::InternalMacro(internal_macro) => {
                machine.call(CompileInternalMacro(internal_macro)).await?
            }
            AnyMacro::JsonGCode(json_gcode) => {
                let gcode = json_gcode.try_to_string(line)?;
                Ok(vec![AnnotatedGCode::GCode(gcode)])
            }
        }
    }
}

pub fn compile_macros<'a>(
    machine: xactor::Addr<Machine>,
    gcode_lines: impl Stream<Item = std::io::Result<String>>
) -> impl Stream<Item = Result<AnnotatedGCode>> + Unpin {
    let stream = gcode_lines
        // Process macros and generate annotations
        .scan(machine, move |machine, line| {
            let machine = machine.clone();
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
                    AnyMacro::compile(&line, &machine).await
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
        });
    Box::pin(stream)
}
