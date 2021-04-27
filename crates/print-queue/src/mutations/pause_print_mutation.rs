use eyre::{
    Result,
    eyre,
    // Context as _,
};
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use machine::messages::{GetData, PauseTask};
use teg_json_store::Record;
use teg_machine::{MachineMap, machine, task::Task};

use crate::{part::Part, resolvers::print_resolvers::Print, task_from_hook};

#[derive(Default)]
pub struct PausePrintMutation;

#[async_graphql::Object]
impl PausePrintMutation {
    /// Pauses a print
    async fn pause_print<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(name="taskID")]
        task_id: ID,
    ) -> FieldResult<Print> {
        let db: &crate::Db = ctx.data()?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            let task = Task::get(db, &task_id, false).await?;
            let part_id = task.part_id
                .as_ref()
                .ok_or_else(|| eyre!("Task is not a print"))?
                .into();

            let machine = machines.get(&(&task.machine_id).into())
                .ok_or_else(||
                    eyre!("machine (ID: {}) not found for print pause", task.machine_id)
                )?;

            let config = machine.call(GetData).await??.config;
            let core_plugin = config.core_plugin()?;

            let gcodes = config.toolheads
                .iter()
                .map(|toolhead| {
                    serde_json::json!({
                        "moveBy": {
                            "distances": {"e0": -toolhead.model.pause_retraction_distance},
                            "feedrate": toolhead.model.retraction_speed,
                        },
                    }).to_string()
                })
                .chain(vec![
                    core_plugin.model.pause_hook.clone()
                ])
                .collect::<Vec<_>>()
                .join("\n");

            let pause_hook = task_from_hook(
                &task.machine_id,
                machine.clone(),
                &gcodes,
            ).await?;

            // Pause the task and spool the pause hook
            let msg = PauseTask {
                task_id: task.id.clone(),
                pause_hook,
            };
            let task = machine.call(msg).await??;

            let part = Part::get(db, &part_id, true).await?;

            Result::<_>::Ok(Print {
                id: (&task.id).into(),
                task,
                part,
            })
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
