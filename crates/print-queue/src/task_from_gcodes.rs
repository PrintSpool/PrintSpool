use chrono::prelude::*;
use futures::prelude::*;
use futures::stream::{StreamExt, TryStreamExt};
use anyhow::{
    Result,
    // anyhow,
    // Context as _,
};
use teg_machine::{
    machine::Machine,
    task::{
        TaskContent,
        Task,
    },
};
use teg_macros::{AnnotatedGCode, compile_macros};

pub async fn task_from_hook<'ctx>(
    machine_id: &crate::DbId,
    machine: xactor::Addr<Machine>,
    hook: &String,
) -> Result<Task> {
    let gcodes = hook.lines().map(String::from).collect::<Vec<String>>();
    task_from_gcodes(
        machine_id,
        machine,
        false,
        gcodes,
    ).await
}

pub async fn task_from_gcodes(
    machine_id: &crate::DbId,
    machine: xactor::Addr<Machine>,
    machine_override: bool,
    gcodes: Vec<String>,
) -> Result<Task> {
    /*
    * Preprocess GCodes
    * =========================================================================================
    */
    let gcodes = stream::iter(gcodes)
        .map(|gcode| Ok(gcode));

    // Add annotations
    let mut annotated_gcodes = compile_macros(
        machine,
        gcodes,
    );
    // let annotated_gcodes = Box::pin(annotated_gcodes);

    let mut gcodes = vec![];
    let mut annotations = vec![];

    while let Some(item) = annotated_gcodes.try_next().await? {
        match item {
            AnnotatedGCode::GCode(gcode) => {
                gcodes.push(gcode);
            }
            AnnotatedGCode::Annotation(annotation) => {
                annotations.push(annotation);
            }
        };
    };

    /*
    * Create the task
    * =========================================================================================
    */
    let gcodes = gcodes;
    let total_lines = gcodes.len() as u64;

    let task = Task {
        id: nanoid!(11),
        version: 0,
        created_at: Utc::now(),
        machine_id,
        part_id: None,
        despooled_line_number: None,
        machine_override,
        content: TaskContent::GCodes(gcodes),
        annotations,
        total_lines,
        estimated_filament_meters: None,
        estimated_print_time: None,
        status: Default::default(),
    };

    Ok(task)
}
