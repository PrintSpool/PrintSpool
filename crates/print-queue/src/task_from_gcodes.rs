use futures::prelude::*;
use futures::stream::{StreamExt, TryStreamExt};
use anyhow::{
    Result,
    // anyhow,
    // Context as _,
};
use teg_machine::{machine::Machine, task::{TaskContent, UnsavedTask}};
use teg_macros::{AnnotatedGCode, compile_macros};

pub async fn task_from_hook<'ctx>(
    machine_id: crate::DbId,
    machine: xactor::Addr<Machine>,
    hook: &String,
) -> Result<UnsavedTask> {
    let gcodes = hook.lines().map(String::from).collect::<Vec<String>>();
    task_from_gcodes(
        machine_id,
        machine,
        false,
        gcodes,
    ).await
}

pub async fn task_from_gcodes(
    machine_id: crate::DbId,
    machine: xactor::Addr<Machine>,
    machine_override: bool,
    gcodes: Vec<String>,
) -> Result<UnsavedTask> {
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

    let task = UnsavedTask {
        machine_id,
        machine_override,
        content: TaskContent::GCodes(gcodes),
        annotations,
        total_lines,
    };

    Ok(task)
}
