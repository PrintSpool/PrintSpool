#[macro_use] extern crate tracing;

use serde::{Deserialize, Serialize};
use eyre::{
    // eyre,
    Result,
    Context as _,
};

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

struct MacrosCompiler<I, C> {
    gcode_lines: I,
    compile_internal_macro: C,
    annotated_gcodes: Vec<AnnotatedGCode>,
}

impl<I, C> Iterator for MacrosCompiler<I, C>
where
    I: Iterator<Item = std::io::Result<String>>,
    C: Fn(InternalMacro) ->  Result<Vec<AnnotatedGCode>> + 'static,
{
    type Item = Result<AnnotatedGCode>;

    fn next(&mut self) -> std::option::Option<<Self as Iterator>::Item> {
        // Order of operations:
        // 1. Check if annotated gcodes have been produced previously and send those.
        // 2. Take the next gcode line off the iterator and if it is a macro compile it into
        //    annotatied gcodes and then go to step 1.
        loop {
            if let Some(gcode) = self.annotated_gcodes.pop() {
                return Some(Ok(gcode))
            }

            return match self.gcode_lines.next()? {
                Ok(line) => {
                    let is_json = line.chars().next() == Some('{');

                    if is_json {
                        // handle internal macros and JSON formatted GCodes
                        let parsed_line: AnyMacro = match serde_json::from_str(&line) {
                            Ok(parsed_line) => parsed_line,
                            Err(err) => {
                                let err = Err(err)
                                    .with_context(|| format!("Invalid JSON GCode: {:?}", line));

                                return Some(err)
                            }
                        };

                        match parsed_line {
                            AnyMacro::InternalMacro(internal_macro) => {
                                // Use the `compile_internal_macro closure` to generate annotated
                                // gcode from the macro.
                                let compile = &self.compile_internal_macro;

                                match compile(internal_macro) {
                                    Ok(annotated_gcodes) => {
                                        self.annotated_gcodes = annotated_gcodes;
                                        continue;
                                    }
                                    Err(err) => {
                                        Some(Err(err))
                                    }
                                }
                            }
                            AnyMacro::JsonGCode(json_gcode) => {
                                let gcode = json_gcode.try_to_string(&line)
                                    .map(|gcode| AnnotatedGCode::GCode(gcode));
                                Some(gcode)
                            }
                        }
                    } else {
                        // handle internal string GCodes lines
                        Some(Ok(AnnotatedGCode::GCode(line)))
                    }
                }
                Err(err) => {
                    let err = Err(err)
                        .with_context(|| "Error reading gcodes");

                    Some(err)
                }
            }
        }
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        self.gcode_lines.size_hint()
    }
}

pub fn compile_macros<'a, C>(
    gcode_lines: impl Iterator<Item = std::io::Result<String>>,
    compile_internal_macro: C,
) -> impl Iterator<Item = Result<AnnotatedGCode>>
where
    C: Fn(InternalMacro) ->  Result<Vec<AnnotatedGCode>> + 'static,
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

    MacrosCompiler {
        gcode_lines,
        compile_internal_macro,
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
                        (*next_line_number, annotation)
                    ))
                },
                Err(err) => Err(err),
            };

            Some(result)
        })
}
