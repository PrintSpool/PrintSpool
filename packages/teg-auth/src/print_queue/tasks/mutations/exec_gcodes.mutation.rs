use std::sync::Arc;
use futures::stream::{StreamExt};
use serde::{Deserialize, Serialize};
use async_graphql::*;
use anyhow::{
    anyhow,
    Context as _,
};

use crate::models::{
    VersionedModel,
    VersionedModelError,
};
use crate::{
    Machine,
    // MachineStatus,
    print_queue::macros::AnyMacro,
};
use super::*;

#[InputObject]
#[derive(Debug)]
struct ExecGCodesInput {
    #[field(name="machineID")]
    machine_config_id: ID,

    /// If true blocks the mutation until the GCodes have been spooled to the machine
    /// (default: false)
    ///
    /// This means that for example if you use execGCodes to run `G1 X100\nM400` the
    /// mutation will wait until the toolhead has moved 100mm and then return.
    ///
    /// This can be useful for informing users whether an action is in progress or
    /// completed.
    ///
    /// If the machine errors during the execution of a `sync = true` GCode the mutation will
    /// fail.
    sync: Option<bool>,

    /// If true allows this gcode to be sent during a print and inserted before the print gcodes.
    /// This can be used to override print settings such as extuder temperatures and fan speeds
    /// (default: false)
    ///
    /// override GCodes will not block. Cannot be used with sync = true.
    r#override: Option<bool>,

    /// In addition to GCodes strings (eg. `gcodes: ["G1 X10"]`), Teg also supports a
    /// JSON format to simplify writing gcode n javascript:
    ///
    ///     `gcodes: [{ g1: { x: 10 } }, { g1: { y: 20 } }]`
    ///
    /// Macros are able to be included in GCode via JSON as well:
    ///
    ///     `gcodes: [{ g1: { x: 10 } }, { delay: { period: 5000 } }]`
    gcodes: Vec<Json<GCodeLine>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum GCodeLine {
    String(String),
    Json(AnyMacro),
}

#[derive(Default)]
pub struct ExecGCodesMutation;

#[Object]
impl ExecGCodesMutation {
    /// Spools and executes GCode outside of the job queue.
    ///
    /// See ExecGCodesInput.gcodes for GCode formatting options.
    #[field(name="execGCodes")]
    async fn exec_gcodes<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: ExecGCodesInput,
    ) -> FieldResult<Task> {
        info!("exec_gcodes {:#?}", input);

        let ctx: &Arc<crate::Context> = ctx.data()?;
        let machine_override = input.r#override.unwrap_or(false);

        let machine_id = Machine::find(&ctx.db, |m| {
            m.config_id == input.machine_config_id
        })
            .with_context(|| format!("No machine found for ID: {:?}", input.machine_config_id))?
            .id;

        /*
         * Preprocess GCodes
         * =========================================================================================
         */

        // Normalize the JSON HashMaps into strings. Later JSON lines will be deserialized
        // the specific macro's input.
        let gcodes: Vec<String> = input.gcodes
            .iter()
            .flat_map(|line| {
                match &line.0 {
                    GCodeLine::String(lines) => {
                        // Split newlines
                        lines.split('\n')
                            .map(|line| Ok(line.to_string()))
                            .collect()
                    },
                    GCodeLine::Json(any_macro) => {
                        let result = serde_json::to_string(any_macro)
                            .with_context(|| "Unable to serialize execGCodes json gcode");

                        vec![result]
                    },
                }
            })
            .collect::<anyhow::Result<_>>()?;

        /*
         * Insert task and sync task completion
         * =========================================================================================
         */

        let mut task = Task::from_gcodes(
            machine_id,
            gcodes,
            ctx,
        ).await?;

        task.machine_override = machine_override;
        let mut task_stream = Task::watch_id(&ctx.db, task.id)?;

        info!("task {:?}", task);

        let task = ctx.db.transaction(move |db| {
            let machine = Machine::get(&db, machine_id)?;

            if !machine.status.can_start_task(&task, false) {
                Err(VersionedModelError::from(
                    anyhow!("Cannot start task when machine is: {:?}", machine.status)
                ))?;
            };

            let task = task.clone().insert(&db)?;

            Ok(task)
        })?;

        // Sync Mode: Block until the task is settled
        if input.sync.unwrap_or(false) {
            loop {
                use crate::models::versioned_model::Event;

                let event = task_stream.next().await
                    .ok_or_else(|| anyhow!("execGCodes task stream unexpectedly ended"))??;

                match event {
                    Event::Insert{ value: task, .. } => {
                        if task.status.was_successful() {
                            return Ok(task)
                        } else if task.status.was_aborted() {
                            let err = task.error_message.unwrap_or(
                                format!("Task Aborted. Reason: {:?}", task.status),
                            );

                            return Err(anyhow!(err).into());
                        }
                    }
                    Event::Remove { .. } => {
                        Err(anyhow!("Task was deleted before it settled"))?;
                    }
                }
            }
        } else {
            Ok(task)
        }
    }
}
