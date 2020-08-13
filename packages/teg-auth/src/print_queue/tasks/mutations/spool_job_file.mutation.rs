// use std::collections::HashMap;
// use chrono::prelude::*;
use std::sync::Arc;
use async_graphql::{
    InputObject,
    Object,
    ID,
    FieldResult,
};
// use serde::{Deserialize, Serialize};
use anyhow::{
    anyhow,
    // Result,
    Context as _,
};

use crate::models::{
    VersionedModel,
    VersionedModelError,
};
use crate::print_queue::tasks::{
    Task,
    Print,
    // TaskStatus,
    TaskContent,
    Part,
};
use crate::machine::models::{
    Machine,
    MachineStatus,
    Printing,
};

pub struct SpoolJobFileMutation;

#[InputObject]
struct SpoolJobFileInput {
    #[field(name="machineID")]
    machine_config_id: ID,
    // TODO: update graphql names to match latest Sled fields
    // #[field(name="partID")]
    #[field(name="jobFileID")]
    part_id: ID,
}

// fn spool_job_transaction(
//     ctx: &Arc<crate::Context>,
//     machine: &Machine,
//     input: &SpoolJobFileInput) -> anyhow::Result<Task> {

// }


#[Object]
impl SpoolJobFileMutation {
    /// Starts a print by spooling a task to print the job file.
    async fn spool_job_file<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: SpoolJobFileInput,
    ) -> FieldResult<Task> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let machine_id = Machine::find(&ctx.db, |m| {
            m.config_id == input.machine_config_id
        })
            .with_context(|| format!("No machine found for ID: {:?}", input.machine_config_id))?
            .id;

        let task = ctx.db.transaction(move |db| {
            // spool_job_transaction(ctx, &machine, &input)

            let part = Part::get(&db, &input.part_id)?;

            // TODO:
            // Preprocess the gcode file
            let total_lines = 0 as u64;
            let annotations = vec![];
            let processed_gcode_file = "TODO".to_string();

            // Create the task
            let mut task = Task::new(
                Task::generate_id(&ctx.db)?,
                machine_id.clone(),
                TaskContent::FilePath(processed_gcode_file),
                annotations,
                total_lines,
            );

            task.print = Some(Print {
                part_id: part.id,
                package_id: part.package_id,
                print_queue_id: part.print_queue_id,
            });

            let task = task.insert(&db)?;

            // Atomically set the machine status to printing
            let task_id = task.id.clone();
            let mut machine = Machine::get(
                &db,
                &machine_id,
            )?;
            let task_id = task_id.clone();

            if !machine.status.can_start_task(&task) {
                Err(VersionedModelError::from(
                    anyhow!("Cannot start task when machine is: {:?}", machine.status)
                ))?;
            };

            if machine.status == MachineStatus::Ready {
                machine.status = MachineStatus::Printing(
                    Printing { task_id }
                );

                let _ = machine.insert(&db)?;
            };

            Ok(task)
        // }).map_err(|e|
        //     anyhow!("Error while creating task {:?}", e)
        // )?;
        }).with_context(|| "Error while creating task")?;

        Ok(task)
    }
}
