// use std::collections::HashMap;
// use chrono::prelude::*;
// use async_std::prelude::*;
use futures::prelude::*;
use async_std::{
    fs::{ self, File },
    io::{ BufReader, BufWriter },
    stream,
};
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use teg_json_store::Record;
use teg_macros::{
    compile_macros,
    AnnotatedGCode,
};
use teg_machine::{machine::{Machine, MachineStatus, Printing, messages::{GetData, SpoolTask}}, task::{
        Task,
        // TaskStatus,
        TaskContent,
    }};
use xactor::Handler;

use crate::{
    print::Print,
    package::Package,
    part::Part,
};

pub async fn insert_print(
    db: &crate::Db,
    machine: xactor::Addr<Machine>,
    machine_id: crate::DbId,
    part_id: crate::DbId,
    print_id: crate::DbId,
    automatic_print: bool,
) -> Result<Task> {
    let part_file_path = Part::get(&db, part_id).await?.file_path;

    let task_id = nanoid!();
    let task_dir = "/var/lib/teg/tasks";
    let task_file_path = format!("{}/task_{}.gcode", task_dir, task_id.to_string());

    let config = machine.call(GetData).await??.config;
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
        machine.clone(),
        gcodes,
    );

    fs::create_dir_all(task_dir).await?;
    let task_file = File::create(&task_file_path).await?;
    let gcodes_writer = BufWriter::new(task_file);

    let (
        mut gcodes_writer,
        total_lines,
        annotations,
        estimated_print_time,
        estimated_filament_meters,
    ) = annotated_gcodes
        .try_fold(
            (gcodes_writer, 0u64, vec![], None, None),
            |mut acc, item| {
                async {
                    let (
                        gcodes_writer,
                        total_lines,
                        annotations,
                        estimated_print_time,
                        estimated_filament_meters,
                    ) = &mut acc;

                    match item {
                        AnnotatedGCode::GCode(mut gcode) => {
                            // Parse the print time and filament usage estimates
                            use nom_gcode::{ parse_gcode, GCodeLine, DocComment };

                            let doc = parse_gcode(&gcode);
                            if let Ok((_, Some(GCodeLine::DocComment(doc)))) = doc {
                                match doc {
                                    DocComment::FilamentUsed { meters } => {
                                        *estimated_filament_meters = Some(meters);
                                    }
                                    DocComment::PrintTime(time) => {
                                        *estimated_print_time = Some(time);
                                    }
                                    _ => {}
                                };
                            };
                            // Add the gcode
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

    let task = Task {
        id: task_id.clone(),
        version: 0,
        created_at: Utc::now(),
        // Foreign Keys
        machine_id: machine_id.clone(),
        // Content
        content: TaskContent::FilePath(task_file_path.clone()),
        // Props
        annotations: annotations.clone(),
        total_lines,
        despooled_line_number: None,
        machine_override: false,
        status: Default::default(),
    };

    let print_task = PrintTask {
        id: naonid!(),
        version: 0,
        created_at: Utc::now(),
        // Foreign Keys
        print_id: print_id.clone(),
        part_id: part_id.clone(),
        task_id: task.id.clone(),
        // Props
        estimated_print_time,
        estimated_filament_meters,
    };

    let msg = SpoolPrintTask {
        task,
        print_task,
    };
    machine.call(msg).await??;

    Ok(task)
}


#[xactor::message(result = "Result<Task>")]
#[derive(Debug)]
pub struct SpoolPrintTask {
    task: Task,
    print_task: PrintTask,
}

#[async_trait::async_trait]
impl xactor::Handler<SpoolPrintTask> for Machine {
    #[instrument(skip(self, _ctx))]
    async fn handle(
        &mut self,
        ctx: &mut xactor::Context<Self>,
        msg: SpoolPrintTask
    ) -> Result<Task> {
        let part = Part::get(&self.db, print_task.part_id).await?;
        let package = Package::get(&self.db, part.package_id).await?;

        /*
        * Create the task
        * =========================================================================================
        */
        let tx = self.db.begin().await;

        // Get the number of printed parts and the total number of prints
        let ( printed, total_prints ) = print_task.get_stats(&print_id, &package);

        if printed >= total_prints {
            Err(
                anyhow!("Already printed {} / {} of {}", printed, total_prints, part.name)
            )?;
        }

        task.insert_no_rollback(&mut tx).await?;
        print_task.insert_no_rollback(&mut tx).await?;

        // Atomically set the machine status to printing
        let task_id = task.id.clone();
        let mut machine = Machine::get(
            &db,
            machine_id,
        )?;
        let task_id = task_id.clone();

        if machine.pausing_task_id.is_some() {
            Err(VersionedModelError::from(
                anyhow!("Cannot start a new print when an existing print is paused")
            ))?;
        }
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

        tx.commit().await?;

        // (self as xactor::Handler<SpoolTask>)
        self.handle(
            &mut ctx,
            SpoolTask { task },
        ).await??;

        Ok(task)
    }
}
