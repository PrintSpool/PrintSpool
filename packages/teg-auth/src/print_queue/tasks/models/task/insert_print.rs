// use std::collections::HashMap;
// use chrono::prelude::*;
// use async_std::prelude::*;
use futures::prelude::*;
use async_std::{
    fs::{ self, File },
    io::{ BufReader, BufWriter },
    stream,
};

use std::sync::Arc;
// use serde::{Deserialize, Serialize};
use anyhow::{
    anyhow,
    Result,
    // Context as _,
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
    Package,
    Part,
};
use crate::machine::models::{
    Machine,
    MachineStatus,
    Printing,
};

impl Task {
    pub async fn insert_print(
        ctx: &Arc<crate::Context>,
        machine_id: u64,
        part_id: u64,
        automatic_print: bool,
    ) -> Result<Task> {
        let part_file_path = Part::get(&ctx.db, part_id)?.file_path;

        let task_id = Task::generate_id(&ctx.db)?;
        let task_dir = "/var/lib/teg/tasks";
        let task_file_path = format!("{}/task_{}.gcode", task_dir, task_id.to_string());

        let config = ctx.machine_config.load();
        let core_plugin = config.core_plugin()?;

        /*
         * Preprocess GCodes (part file => task file)
         * =========================================================================================
         */

        let part_file = File::open(part_file_path).await?;
        let gcodes = BufReader::new(part_file).lines();

        let hook = |hook_gcodes: &String| {
            let iter = hook_gcodes
                .lines()
                .map(|gcode| Ok(gcode.to_string()))
                .collect::<Vec<_>>()
                .into_iter();
            stream::from_iter(iter)
        };

        // info!("before hook: {:#?}", core_plugin.model.before_print_hook);
        // info!("after hook: {:#?}", core_plugin.model.after_print_hook);
        let before_hook = hook(&core_plugin.model.before_print_hook);
        let after_hook = hook(&core_plugin.model.after_print_hook);

        let gcodes = before_hook
            .chain(gcodes)
            .chain(after_hook);

        let annotated_gcodes = compile_macros(
            Arc::clone(&ctx),
            gcodes,
        );

        fs::create_dir_all(task_dir).await?;
        let task_file = File::create(&task_file_path).await?;
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
            let part = Part::get(&db, part_id)?;
            let package = Package::get(&db, part.package_id)?;

            if part.is_done(&package) {
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
                machine_id,
            )?;
            let task_id = task_id.clone();

            if !machine.status.can_start_task(&task, automatic_print) {
                Err(VersionedModelError::from(
                    anyhow!("Cannot start task when machine is: {:?}", machine.status)
                ))?;
            };

            if machine.status == MachineStatus::Ready {
                machine.status = MachineStatus::Printing(
                    Printing { task_id }
                );

                machine.insert(&db)?;
            };

            Ok(task)
        })?;

        ctx.db.flush_async().await?;

        Ok(task)
    }
}
