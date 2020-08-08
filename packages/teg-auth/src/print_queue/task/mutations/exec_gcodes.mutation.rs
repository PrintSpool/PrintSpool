use std::collections::HashMap;
// use chrono::prelude::*;
use async_graphql::*;
use serde::{Deserialize, Serialize};

// use super::revisions::*;

pub struct Mutation;

#[Object]
impl Mutation {
    // /// Spools and executes GCode outside of the job queue.
    // ///
    // /// execGCodes is synchronous and will return only once the GCode has executed
    // /// and any resulting machine movements are done.
    // ///
    // /// This means that for example if you use execGCodes to run \`G1 X100\nM400\` the
    // /// mutation will wait until the toolhead has moved 100mm and then return.
    // ///
    // /// This can be useful for informing users whether an action is in progress or
    // /// completed.
    // ///
    // /// If the machine errors during the execution of the GCode the mutation will
    // /// fail.
    // ///
    // /// Note a null Task is presently always returned. This may chance in the future
    // /// if we introduce an async flag for execGCodes.
    // ///
    // /// See ExecGCodesInput.gcodes for GCode formatting options.
    // #[field(name="execGCodes")]
    // async fn exec_gcodes(input: ExecGCodesInput): Task {

    // }
}

#[InputObject]
struct ExecGCodesInput {
    #[field(name="machineID")]
    machine_id: ID,

    /// If true blocks the mutation until the GCodes have been spooled to the machine (default: false)
    #[field(default=false)]
    sync: bool,

    /// If true allows this gcode to be sent during a print and inserted before the print gcodes. This can
    /// be used to override print settings such as extuder temperatures and fan speeds (default: false)

    /// override GCodes will not block. Cannot be used with sync = true.
    #[field(default=false)]
    r#override: bool,

    /// Teg supports 3 formats of GCode:
    ///
    /// 1. Standard GCode Strings
    /// eg. \`gcodes: ["G1 X10", "G1 Y20"]\`
    /// and equivalently:
    /// \`gcodes: ["G1 X0\nG1 Y0"]\`
    /// 2. JSON GCode Objects - To make constructing GCode easier with modern languages Teg allows GCodes to be sent as JSON objects in the format { [GCODE|MACRO]: ARGS }.
    /// eg. \`gcodes: [{ g1: { x: 10 } }, { g1: { y: 20 } }]\`
    /// Macros can also be called using JSON GCode Objects.
    /// eg. \`gcodes: [{ g1: { x: 10 } }, { delay: { period: 5000 } }]\`
    /// 3. JSON GCode Strings - Teg allows GCodes to be serialized as JSON. JSON GCode Strings can also be Macro calls.
    /// GCode: \`gcodes: ["{ \"g1\": { \"x\": 10 } }", "{ \"delay\": { \"period\": 5000 } }"]\`
    gcodes: Json<Vec<GCodeLine>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum GCodeLine {
    String(String),
    JSON(Json<HashMap<String, HashMap<String, GCodeValue>>>),
}

#[derive(Debug, Serialize, Deserialize, Clone)]
enum GCodeValue {
    String(String),
    F32(f32),
    Bool(bool),
}
