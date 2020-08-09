use std::sync::Arc;
use futures::prelude::*;
use std::collections::HashMap;
use chrono::prelude::*;
use async_graphql::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    anyhow,
    Context as _,
};

use crate::models::VersionedModel;
use crate::{
    print_queue::macros::{
        compile_macros,
        AnnotatedGCode,
    },
};
use super::*;

pub struct Mutation;

#[Object]
impl Mutation {
    /// Spools and executes GCode outside of the job queue.
    ///
    /// See ExecGCodesInput.gcodes for GCode formatting options.
    #[field(name="execGCodes")]
    async fn exec_gcodes<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: ExecGCodesInput,
    ) -> FieldResult<Task> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        if ctx.machine_config.read().await.id != input.machine_id {
            Err(anyhow!("No machine found for ID: {:?}", input.machine_id))?
        };

        // Normalize the JSON HashMaps into strings. Later JSON lines will be deserialized
        // the specific macro's input.
        let gcodes: Vec<String> = input.gcodes
            .iter()
            .flat_map(|line| {
                match line {
                    GCodeLine::String(lines) => {
                        // Split newlines
                        lines.split('\n')
                            .map(|line| Ok(line.to_string()))
                            .collect()
                    },
                    GCodeLine::JSON(json) => {
                        let result = serde_json::to_string(json)
                            .with_context(|| "Unable to load execGCodes json gcode");

                        vec![result]
                    },
                }
            })
            .collect::<anyhow::Result<_>>()?;

        // Add annotations
        let annotated_gcodes = compile_macros(
            Arc::clone(ctx),
            gcodes,
        );

        let (gcodes, annotations) = annotated_gcodes
            .try_fold((vec![], vec![]), |mut acc, item| {
                let (gcodes, annotations) = &mut acc;

                match item {
                    AnnotatedGCode::GCode(gcode) => {
                        gcodes.push(gcode);
                    }
                    AnnotatedGCode::Annotation(annotation) => {
                        annotations.push(annotation);
                    }
                };

                future::ok(acc)
            })
            .await?;

        // Create the task
        let task = TaskBuilder::default()
            .machine_id(input.machine_id)
            .name("[execGCodes]")
            .machine_override(input.r#override)
            .created_at(Utc::now())
            .total_lines(gcodes.len() as u64)
            .content(TaskContent::GCodes(gcodes))
            .annotations(annotations)
            .build()?;

        let mut task = task.insert(&ctx.db).await?;

        // Sync Mode: Block until the task is settled
        if input.sync {
            let mut subscriber = task.watch(&ctx.db)?;
            loop {
                use sled::Event;
                use std::convert::TryInto;

                let event = (&mut subscriber).await;

                match event {
                    Some(Event::Insert{ value, .. }) => {
                        task = value.try_into()?;

                        if task.status.was_successful() {
                            return Ok(task)
                        } else if task.status.was_aborted() {
                            let err = task.error_message
                                .unwrap_or(format!("Task Aborted. Reason: {:?}", task.status));

                            return Err(anyhow!(err).into());
                        }
                    }
                    Some(Event::Remove { .. }) => {
                        Err(anyhow!("Task was deleted before it settled"))?;
                    }
                    None => {
                        Err(anyhow!("execGCodes subscriber unexpectedly ended"))?;
                    }
                }
            }
        };

        Ok(task)
    }
}

#[InputObject]
struct ExecGCodesInput {
    #[field(name="machineID")]
    machine_id: ID,

    /// If true blocks the mutation until the GCodes have been spooled to the machine (default: false)
    ///
    /// This means that for example if you use execGCodes to run \`G1 X100\nM400\` the
    /// mutation will wait until the toolhead has moved 100mm and then return.
    ///
    /// This can be useful for informing users whether an action is in progress or
    /// completed.
    ///
    /// If the machine errors during the execution of a `sync = true` GCode the mutation will
    /// fail.
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
