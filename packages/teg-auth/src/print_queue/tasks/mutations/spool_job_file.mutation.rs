// use std::collections::HashMap;
// use chrono::prelude::*;
// use async_std::prelude::*;
use futures::prelude::*;
use async_std::{
    fs::{ self, File },
    io::{ BufReader, BufWriter },
};

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

use crate::{
    // print_queue::macros::AnyMacro,
    print_queue::macros::{
        compile_macros,
        AnnotatedGCode,
    },
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

        let part_file_path = Part::get(&ctx.db, &input.part_id)?.file_path;

        let task_id = Task::generate_id(&ctx.db)?;
        let task_dir = "/var/tegh/tasks";
        let task_file_path = format!("{}/task_{}.gcode", task_dir, task_id.to_string());

        /*
         * Preprocess GCodes (part file => task file)
         * =========================================================================================
         */

        let part_file = File::open(part_file_path).await?;
        let gcodes = BufReader::new(part_file).lines();

        let annotated_gcodes = compile_macros(
            Arc::clone(ctx),
            gcodes,
        );

        fs::create_dir_all(task_dir).await?;
        let task_file = File::open(&task_file_path).await?;
        let gcodes_writer = BufWriter::new(task_file);

        let (
            mut gcodes_writer,
            total_lines,
            annotations
        ) = annotated_gcodes
            .try_fold(
                (gcodes_writer, 0u64, vec![]),
                |mut acc, item| {
                    async {
                        let (
                            gcodes_writer,
                            total_lines,
                            annotations,
                        ) = &mut acc;
    
                        match item {
                            AnnotatedGCode::GCode(mut gcode) => {
                                *total_lines += 1;
                                gcode.push('\n');
                                gcodes_writer.write_all(&gcode.into_bytes()).await?;
                            }
                            AnnotatedGCode::Annotation(annotation) => {
                                annotations.push(annotation);
                            }
                        };

                        Ok(acc)
                    }
                },
            )
            .await?;

        gcodes_writer.flush().await?;
        gcodes_writer.close().await?;

        /*
         * Create the task
         * =========================================================================================
         */

        let task = ctx.db.transaction(move |db| {
            let part = Part::get(&db, &input.part_id)?;

            if part.printed >= part.quantity {
                Err(VersionedModelError::from(
                    anyhow!("Already printed {} / {} of {}", part.printed, part.quantity, part.name)
                ))?;
            }

            let mut task = Task::new(
                task_id.clone(),
                machine_id.clone(),
                TaskContent::FilePath(task_file_path.clone()),
                annotations.clone(),
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
        }).with_context(|| "Unable to create task")?;

        Ok(task)
    }
}
