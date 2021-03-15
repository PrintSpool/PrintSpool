use serde::{Deserialize, Serialize};
use eyre::{
    Result,
    eyre,
    Context as _,
};
use async_graphql::{ID, Context, FieldResult};
use xactor::Actor as _;
use teg_json_store::Record;

use teg_auth::AuthContext;
use teg_machine::{MachineMap, machine::{events::TaskSettled, messages::SpoolTask}, task::{Task, TaskStatus}};
use teg_macros::AnyMacro;

#[derive(async_graphql::InputObject, Debug)]
struct ExecGCodesInput {
    #[graphql(name = "machineID")]
    machine_id: ID,

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
    gcodes: Vec<async_graphql::Json<GCodeLine>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum GCodeLine {
    String(String),
    Json(AnyMacro),
}

#[derive(Default)]
pub struct ExecGCodesMutation;

#[async_graphql::Object]
impl ExecGCodesMutation {
    /// Spools and executes GCode outside of the job queue.
    ///
    /// See ExecGCodesInput.gcodes for GCode formatting options.
    #[graphql(name = "execGCodes")]
    #[instrument(skip(self, ctx))]
    async fn exec_gcodes<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: ExecGCodesInput,
    ) -> FieldResult<Task> {
        let db: &crate::Db = ctx.data()?;
        let auth: &AuthContext = ctx.data()?;

        let _ = auth.require_authorized_user()?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        let machine = machines.get(&input.machine_id)
            .ok_or_else(|| format!("No machine found for ID: {:?}", input.machine_id))?;

        async move {
            let machine_id = input.machine_id.to_string();

            let machine_override = input.r#override.unwrap_or(false);

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
                .collect::<Result<_>>()?;

            /*
            * Insert task and sync task completion
            * =========================================================================================
            */
            let mut tx = db.begin().await?;

            let task = crate::task_from_gcodes(
                &machine_id,
                machine.clone(),
                machine_override,
                gcodes,
            ).await?;
            task.insert_no_rollback(&mut tx).await?;

            // Sync Mode: Initialize a watcher so that it can be used later
            let watcher = if input.sync.unwrap_or(false) {
                let watcher = TaskCompletionWatcher {
                    task_id: task.id.clone(),
                };
                let watcher = watcher
                    .start()
                    .await?;
                Some(watcher)
            } else {
                None
            };

            tx.commit().await?;

            let msg = SpoolTask {
                task,
            };
            let task = machine.call(msg).await??;

            // Sync Mode: Block until the task is settled
            if let Some(watcher) = watcher {
                watcher
                    .wait_for_stop()
                    .await;

                // Refresh the task
                let task = Task::get(db, &task.id, false).await?;

                match task.status {
                    TaskStatus::Finished(_) => {
                        Ok(task)
                    },
                    TaskStatus::Cancelled(_) => {
                        Err(eyre!("Task Cancelled"))?
                    }
                    TaskStatus::Errored(error) => {
                        Err(eyre!(error.message))?
                    }
                    invalid_status => {
                        Err(eyre!("Task settled with invalid status: {:?}", invalid_status))?
                    }
                }
            } else {
                Result::<_>::Ok(task)
            }
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })

    }
}

struct TaskCompletionWatcher {
    pub task_id: crate::DbId,
}

#[async_trait::async_trait]
impl xactor::Actor for TaskCompletionWatcher {
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()>  {
        ctx.subscribe::<TaskSettled>().await?;
        Ok(())
    }
}

#[async_trait::async_trait]
impl xactor::Handler<TaskSettled> for TaskCompletionWatcher {
    async fn handle(
        &mut self,
        ctx: &mut xactor::Context<Self>,
        msg: TaskSettled
    ) -> () {
        // info!("TASK COMPLETED: {:?}", msg);
        if msg.task_id == self.task_id {
            ctx.stop(None);
        }
    }
}
