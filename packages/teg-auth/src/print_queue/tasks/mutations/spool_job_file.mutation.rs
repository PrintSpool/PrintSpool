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

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
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

#[Object]
impl SpoolJobFileMutation {
    /// Starts a print by spooling a task to print the job file.
    async fn spool_job_file<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: SpoolJobFileInput,
    ) -> FieldResult<Task> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let machine = Machine::find(&ctx.db, |m| {
            m.config_id == input.machine_config_id
        })
            .await
            .with_context(|| format!("No machine found for ID: {:?}", input.machine_config_id))?;

        let part = Part::get(&ctx.db, &input.part_id).await?;

        // TODO:
        // Preprocess the gcode file
        let total_lines = 0 as u64;
        let annotations = vec![];
        let processed_gcode_file = "TODO".to_string();

        // Create the task
        let mut task = Task::new(
            Task::generate_id(&ctx.db)?,
            machine.id.clone(),
            TaskContent::FilePath(processed_gcode_file),
            annotations,
            total_lines,
        );

        task.part_id = Some(part.id);
        task.package_id = Some(part.package_id);
        task.print_queue_id = Some(part.print_queue_id);

        let task = task.insert(&ctx.db).await?;

        // Atomically set the machine status to printing
        let task_id = task.id.clone();
        let machine = Machine::fetch_and_update(
            &ctx.db,
            &machine.id,
            move |machine| {
                let mut machine = machine?;
                let task_id = task_id.clone();

                if machine.status == MachineStatus::Ready {
                    machine.status = MachineStatus::Printing(
                        Printing { task_id }
                    );
                };

                Some(machine)
            },
        )
            .await?
            .ok_or_else(|| {
                anyhow!("No machine found while starting task id: {:?}", task.id)
            })?;

        if !machine.status.can_start_task(&task) {
            Err(anyhow!("Cannot start task when machine is: {:?}", machine.status))?;
        };

        Ok(task)
    }
}
