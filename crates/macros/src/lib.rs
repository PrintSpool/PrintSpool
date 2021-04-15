#[macro_use] extern crate tracing;

use std::{pin::Pin, task::{Context, Poll}};

use serde::{Deserialize, Serialize};
use futures::prelude::*;
use eyre::{
    // eyre,
    Result,
    Context as _,
};
use pin_project::pin_project;

// Re-export
pub use teg_machine::task::GCodeAnnotation;

mod internal_macros;
pub use internal_macros::InternalMacro;

mod json_gcode;
pub use json_gcode::JsonGCode;

mod compile_internal_macro;
pub use compile_internal_macro::CompileInternalMacro;

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

// impl AnyMacro {
//     pub async fn compile<C, F>(
//         line: &str,
//         compile_internal_macro: &C,
//     ) -> Result<Vec<AnnotatedGCode>>
//     where
//         C: Fn(InternalMacro) -> F,
//         F: Future<Output = Result<Vec<AnnotatedGCode>>>,
//     {
//         // handle internal macro
//         let parsed_line: AnyMacro = serde_json::from_str(&line)
//             .with_context(|| format!("Invalid JSON GCode: {:?}", line))?;

//         match parsed_line {
//             AnyMacro::InternalMacro(internal_macro) => {
//                 // use teg_machine::machine::Machine;
//                 // use compile_internal_macro::CompileInternalMacro;

//                 // machine.call(CompileInternalMacro(internal_macro)).await?
//                 compile_internal_macro(internal_macro).await
//             }
//             AnyMacro::JsonGCode(json_gcode) => {
//                 let gcode = json_gcode.try_to_string(line)?;
//                 Ok(vec![AnnotatedGCode::GCode(gcode)])
//             }
//         }
//     }
// }

#[pin_project]
struct MacrosCompiler<S, C, F> {
    #[pin]
    gcode_lines: S,
    compile_internal_macro: C,
    #[pin]
    future: Option<F>,
    annotated_gcodes: Vec<AnnotatedGCode>,
}

impl<S, C, F> Stream for MacrosCompiler<S, C, F>
where
    S: Stream<Item = std::io::Result<String>>,
    C: Fn(InternalMacro) -> F + 'static,
    F: Future<Output = Result<Vec<AnnotatedGCode>>>,
{
    type Item = Result<AnnotatedGCode>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        use futures::ready;
        use Poll::*;
        let mut this = self.project();

        // Order of operations:
        // 1. Check if annotated gcodes have been produced previously and send those.
        // 2. Run a macro compilation future if one was created last time. If a gcode is returned
        // go to step 1.
        // 3. Take the next gcode line off the stream and create a macro compilation future. If the
        // stream is not complete then go to step 2 to run the compilation future.
        loop {
            if let Some(gcode) = this.annotated_gcodes.pop() {
                return Ready(Some(Ok(gcode)))
            }

            if let Some(fut) = this.future.as_mut().as_pin_mut() {
                return match ready!(fut.poll(cx)) {
                    Ok(annotated_gcodes) => {
                        *this.annotated_gcodes = annotated_gcodes;
                        continue;
                    }
                    Err(err) => {
                        Ready(Some(Err(err)))
                    }
                }
            }

            return match ready!(this.gcode_lines.as_mut().poll_next(cx)) {
                Some(Ok(line)) => {
                    let is_json = line.chars().next() == Some('{');

                    if is_json {
                        // handle internal macros and JSON formatted GCodes
                        let parsed_line: AnyMacro = match serde_json::from_str(&line) {
                            Ok(parsed_line) => parsed_line,
                            Err(err) => {
                                let err = Err(err)
                                    .with_context(|| format!("Invalid JSON GCode: {:?}", line));

                                return Ready(Some(err))
                            }
                        };

                        match parsed_line {
                            AnyMacro::InternalMacro(internal_macro) => {
                                let f = (this.compile_internal_macro)(internal_macro);
                                this.future.set(Some(f));

                                continue;
                            }
                            AnyMacro::JsonGCode(json_gcode) => {
                                let gcode = json_gcode.try_to_string(&line)?;
                                Ready(Some(Ok(AnnotatedGCode::GCode(gcode))))
                            }
                        }
                    } else {
                        // handle internal string GCodes lines
                        Ready(Some(Ok(AnnotatedGCode::GCode(line))))
                    }
                }
                Some(Err(err)) => {
                    let err = Err(err)
                        .with_context(|| "Error reading gcodes");

                    Ready(Some(err))
                }
                None => {
                    Ready(None)
                }
            }
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        self.gcode_lines.size_hint()
    }
}

pub fn compile_macros<'a, C, F>(
    gcode_lines: impl Stream<Item = std::io::Result<String>>,
    compile_internal_macro: C,
) -> impl Stream<Item = Result<AnnotatedGCode>> + Unpin
where
    C: Fn(InternalMacro) -> F + 'static,
    F: Future<Output = Result<Vec<AnnotatedGCode>>>,
{

    // let stream = gcode_lines
    //     .zip(stream::unfold(compile_internal_macro, )
    //     // Process macros and generate annotations
    //     .then(|(line, cim)| {
    //         async move {
    //             let line = line
    //                 .with_context(|| "Error reading gcodes");
    //             let line = match line {
    //                 Ok(line) => line.clone(),
    //                 Err(err) => return Err(err),
    //             };
    //             let is_json = line.chars().next() == Some('{');

    //             if is_json {
    //                 // handle internal macros and JSON formatted GCodes
    //                 AnyMacro::compile(&line, &cim).await
    //             } else {
    //                 // handle internal string GCodes lines
    //                 Ok(vec![AnnotatedGCode::GCode(line)])
    //             }
    //         }
    //     })
    // // Flatten the resulting gcodes and annotations
    // .map_ok(|annotated_gcodes| {
    //     stream::iter(annotated_gcodes).map(|item| -> Result<AnnotatedGCode> {
    //         Ok(item)
    //     })
    // })
    // .try_flatten()
    // Add line numbers to annotations

    let stream = MacrosCompiler {
        gcode_lines,
        compile_internal_macro,
        future: None,
        annotated_gcodes: vec![],
    }
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
