use chrono::prelude::*;
// use async_std::prelude::*;
use futures::prelude::*;
use async_std::{
    fs::{ self, File },
    io::{ BufReader, BufWriter },
    stream,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use teg_json_store::Record;
use teg_macros::{AnnotatedGCode, GCodeAnnotation, InternalMacro, compile_macros};
use teg_machine::{
    machine::{
        Machine,
        MachineStatus,
        Printing,
        messages::GetData,
    },
    task::{
        Task,
        // TaskStatus,
        TaskContent,
    },
};

use crate::{
    part::Part,
};

#[instrument(skip(db, machine))]
pub async fn insert_print(
    db: &crate::Db,
    machine: xactor::Addr<Machine>,
    machine_id: crate::DbId,
    part_id: crate::DbId,
    automatic_print: bool,
) -> Result<Task> {
    let part_file_path = Part::get(
        db,
        &part_id,
        false,
    )
        .await?
        .file_path;

    let task_id = nanoid!(11);
    let task_dir = "/var/lib/teg/tasks";
    let task_file_path = format!("{}/task_{}.gcode", task_dir, task_id.to_string());
    fs::create_dir_all(task_dir).await?;

    let config = machine.call(GetData).await??.config;
    let core_plugin = config.core_plugin()?;

    /*
     * Preprocess GCodes (part file => task file)
     * =========================================================================================
     */

    use teg_macros::CompileInternalMacro;

    let machine_clone = machine.clone();
    let compile_internal_macro = move |internal_macro| {
        let machine = machine_clone.clone();
        async move {
            machine.call(CompileInternalMacro(internal_macro)).await?
        }
    };

    let read_buffer_size = 1024 * 1024; // 1 MB
    let write_buffer_size = read_buffer_size;

    let PrintMetaData {
        annotations,
        total_lines,
        estimated_print_time,
        estimated_filament_meters,
    } = compile_print_file(
        &part_file_path,
        &task_file_path,
        &core_plugin.model.before_print_hook,
        &core_plugin.model.after_print_hook,
        compile_internal_macro,
        read_buffer_size,
        write_buffer_size,
    ).await?;

    let task = Task {
        id: task_id.clone(),
        version: 0,
        created_at: Utc::now(),
        deleted_at: None,
        // Foreign Keys
        machine_id: machine_id.clone(),
        part_id: Some(part_id.clone()),
        // Content
        content: TaskContent::FilePath(task_file_path.clone()),
        // Props
        annotations: annotations.clone(),
        total_lines,
        despooled_line_number: None,
        machine_override: false,
        estimated_print_time,
        estimated_filament_meters,
        status: Default::default(),
    };

    let msg = SpoolPrintTask {
        task,
        automatic_print,
    };

    let task = machine.call(msg).await??;

    Ok(task)
}

pub struct PrintMetaData {
    pub annotations: Vec<(u64, GCodeAnnotation)>,
    pub total_lines: u64,
    pub estimated_print_time: Option<std::time::Duration>,
    pub estimated_filament_meters: Option<f64>,
}

// Minimal core of insert_print - reused in benchmarks.
pub async fn compile_print_file<C, F>(
    part_file_path: &str,
    task_file_path: &str,
    before_print_hook: &str,
    after_print_hook: &str,
    compile_internal_macro: C,
    read_buffer_size: usize,
    write_buffer_size: usize,
) -> Result<PrintMetaData>
where
    C: Fn(InternalMacro) -> F + 'static,
    F: Future<Output = Result<Vec<AnnotatedGCode>>>,
{
    let hook = |hook_gcodes: &str| {
        let iter = hook_gcodes
            .lines()
            .map(|gcode| Ok(gcode.to_string()))
            .collect::<Vec<_>>()
            .into_iter();
        stream::from_iter(iter)
    };

    // info!("before hook: {:#?}", core_plugin.model.before_print_hook);
    // info!("after hook: {:#?}", core_plugin.model.after_print_hook);
    let before_hook = hook(before_print_hook);
    let after_hook = hook(after_print_hook);


    let part_file = File::open(part_file_path).await?;
    let gcodes = BufReader::with_capacity(
        read_buffer_size,
        part_file,
    ).lines();

    let gcodes = before_hook
        .chain(gcodes)
        .chain(after_hook);

    let mut annotated_gcodes = compile_macros(
        gcodes,
        compile_internal_macro,
    );

    let task_file = File::create(&task_file_path).await?;
    let mut gcodes_writer = BufWriter::with_capacity(
        write_buffer_size,
        task_file,
    );

    let start = std::time::Instant::now();

    let mut total_lines = 0u64;
    let mut annotations = vec![];
    let mut estimated_print_time = None;
    let mut estimated_filament_meters= None;

    let mut line_start = std::time::Instant::now();

    info!("Parsing Print");

    while let Some(item) = annotated_gcodes.try_next().await? {
        let read_in = line_start.elapsed();
        let parse_start = std::time::Instant::now();

        let should_parse_line =
            total_lines < 100
            && (estimated_filament_meters == None || estimated_print_time == None);

        match item {
            AnnotatedGCode::GCode(mut gcode) => {
                // Parse the print time and filament usage estimates
                use nom_gcode::{ parse_gcode, GCodeLine, DocComment };

                if should_parse_line {
                    let doc = parse_gcode(&gcode);
                    if let Ok((_, Some(GCodeLine::DocComment(doc)))) = doc {
                        match doc {
                            DocComment::FilamentUsed { meters } => {
                                estimated_filament_meters = Some(meters);
                            }
                            DocComment::PrintTime(time) => {
                                estimated_print_time = Some(time);
                            }
                            _ => {}
                        };
                    };
                }
                // Add the gcode
                let parsed_in = parse_start.elapsed();
                let write_start = std::time::Instant::now();

                total_lines += 1;
                gcode.push('\n');
                gcodes_writer.write_all(&gcode.into_bytes()).await?;

                if should_parse_line || total_lines % 1000 == 0 {
                    let written_in = write_start.elapsed();

                    trace!(
                        "Read + Compile Macros: {:?} / Parse: {:?} / Write: {:?} / Total: {:?}",
                        read_in,
                        parsed_in,
                        written_in,
                        read_in + parsed_in + written_in,
                    );
                }
            }
            AnnotatedGCode::Annotation(annotation) => {
                annotations.push(annotation);
            }
        };

        line_start = std::time::Instant::now();
    };

    info!("Print GCodes Parsed in: {:?}", start.elapsed());

    gcodes_writer.flush().await?;
    gcodes_writer.close().await?;

    Ok(PrintMetaData {
        annotations,
        total_lines,
        estimated_print_time,
        estimated_filament_meters,
    })
}


#[xactor::message(result = "Result<Task>")]
#[derive(Debug)]
pub struct SpoolPrintTask {
    task: Task,
    automatic_print: bool,
}

#[async_trait::async_trait]
impl xactor::Handler<SpoolPrintTask> for Machine {
    #[instrument(skip(self, ctx))]
    async fn handle(
        &mut self,
        ctx: &mut xactor::Context<Self>,
        msg: SpoolPrintTask
    ) -> Result<Task> {
        let SpoolPrintTask {
            task,
            automatic_print,
        } = msg;
        let task_id = task.id.clone();

        let mut tx = self.db.begin().await?;
        let machine = self.get_data()?;

        let part_id = task.part_id
            .as_ref()
            .ok_or_else(|| eyre!("New print missing part id"))?;
        let part = Part::get(&mut tx, &part_id, false).await?;

        // Get the number of printed parts and the total number of prints
        let total_prints = Part::query_total_prints(&mut tx, &part_id)
            .await?;
        let prints_in_progress = Part::query_prints_in_progress(
            &mut tx,
            &part_id,
        true,
        )
            .await?;

        if prints_in_progress as i64 >= total_prints {
            Err(
                eyre!(
                    "Already printing {} / {} of {}",
                    prints_in_progress,
                    total_prints,
                    part.name,
                )
            )?;
        }

        task.insert_no_rollback(&mut tx).await?;

        machine.status.verify_can_start(&task, automatic_print)?;

        tx.commit().await?;

        // Spool the task outside the transaction to avoid locking the database on unix socket IO
        let (_, task) = self.spool_task(task)
            .await
            .map_err(|err| {
                error!("Error spooling print #{}: {:?}", task_id, err);
                ctx.stop(Some(err));

                eyre!("Unable to spool print")
            })?;

        // Set the machine status to printing
        let mut machine = self.get_data()?;

        machine.status = MachineStatus::Printing(
            Printing {
                task_id: task.id.clone(),
                paused: false,
                paused_state: None,
            }
        );

        info!("Starting Print #{} on Machine #{}", task.id, self.id);

        Ok(task)
    }
}
