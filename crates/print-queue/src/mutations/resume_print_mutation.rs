use chrono::prelude::*;
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
use machine::messages::{GetData, ResumeTask};
use printspool_json_store::Record;
use printspool_machine::{MachineMap, machine::{self, MachineStatus, PositioningUnits, Printing}, task::{Task, TaskStatus}};

use crate::{part::Part, resolvers::print_resolvers::Print, task_from_hook};

#[derive(Default)]
pub struct ResumePrintMutation;

#[async_graphql::Object]
impl ResumePrintMutation {
    /// Resumes a paused print
    async fn resume_print<'ctx>(
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

            let machine_data = machine.call(GetData).await??;

            // Verify this task was paused
            let paused_state = match &machine_data.status {
                MachineStatus::Printing(Printing {
                    paused: true,
                    paused_state: None,
                    ..
                }) => {
                    return Err(eyre!(
                        "Paused state not set properly. Machine may need to be reset."
                    ).into())
                }
                MachineStatus::Printing(Printing {
                    paused: true,
                    paused_state: Some(paused_state),
                    task_id: printing_task_id,
                }) if *printing_task_id == task_id.0 => {
                    paused_state
                }
                _ => {
                    return Err(eyre!(
                        "Cannot resume. This print is not paused."
                    ).into())
                }
            };

            let config = machine.call(GetData).await??.config;
            let core_plugin = config.core_plugin()?;

            // Move the machine back to the last position of the paused print
            let move_to_paused_positions = paused_state.config.axes
                .iter()
                .flat_map(|axis| {
                    if let Some(target) = axis.ephemeral.target_position {
                        Some(serde_json::json!({
                            "moveTo": {
                                "positions": { axis.model.address.clone(): target },
                            },
                        }).to_string())
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>();

            let reprime_extruders = config.toolheads
                .iter()
                .map(|toolhead| {
                    serde_json::json!({
                        "moveBy": {
                            "distances": { "e0": toolhead.model.pause_retraction_distance },
                            "feedrate": toolhead.model.retraction_speed,
                        },
                    }).to_string()
                })
                .chain(vec![
                    core_plugin.model.resume_hook.clone()
                ])
                .collect::<Vec<_>>();

            let gcodes = vec![
                vec![
                    core_plugin.model.resume_hook.clone(),
                    "G90".to_string(),
                    "G21".to_string(),
                ],
                move_to_paused_positions,
                vec![
                    // Reset motors enabled, absolute positioning, and inches/millimeters
                    if paused_state.motors_enabled {
                        "M17"
                    } else {
                        "M18"
                    }.to_string(),
                    if paused_state.absolute_positioning {
                        "G90"
                    } else {
                        "G91"
                    }.to_string(),
                    match paused_state.positioning_units {
                        PositioningUnits::Millimeters => "G21",
                        PositioningUnits::Inches => "G20",
                    }.to_string(),
                ],
                reprime_extruders,
            ]
                .into_iter()
                .flatten()
                .collect::<Vec<_>>()
                .join("\n");

            let resume_hook = task_from_hook(
                &task.machine_id,
                machine.clone(),
                &gcodes,
            ).await?;

            let mut tx = db.begin().await?;
            // Re-fetch the task within the transaction
            let mut task = Task::get(&mut tx, &task_id, false).await?;

            if task.status.is_settled() {
                Err(eyre!("Cannot resume a task that is {}", task.status.to_db_str()))?;
            }

            if !task.is_print() {
                Err(eyre!("Cannot resume task because task is not a print"))?;
            }

            // handle redundant calls as a no-op to pause idempotently
            if task.status.is_paused() {
                // Update the amount of time the task has been paused
                task.time_paused += if let TaskStatus::Paused(paused_status) = task.status {
                    (Utc::now() - paused_status.paused_at).to_std()?
                } else {
                    return Err(eyre!("Cannot resume task be task is not paused").into())
                };

                task.status = TaskStatus::Created(Default::default());

                task.update(&mut tx).await?;
                resume_hook.insert_no_rollback(&mut tx).await?;

                tx.commit().await?;

                // Spool the resume hook and then the task
                let msg = ResumeTask {
                    task: task,
                    resume_hook,
                };
                task = machine.call(msg).await??;
            }

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
