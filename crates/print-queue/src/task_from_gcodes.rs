use chrono::prelude::*;
// use futures::prelude::*;
// use futures::stream::{StreamExt, TryStreamExt};
use eyre::{
    Result,
    // eyre,
    // Context as _,
};
use teg_machine::{
    machine::Machine,
    task::{
        TaskContent,
        Task,
    },
};
use teg_macros::{AnnotatedGCode, compile_macros, CompileInternalMacro};

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
    let machine_clone = machine.clone();

    let (
        gcodes,
        annotations,
    ) = async_std::task::spawn_blocking(move || {
        let gcodes = gcodes
            .into_iter()
            .map(|gcode| Ok(gcode));

        // Add annotations
        let compile_internal_macro = move |internal_macro| {
            let machine = machine_clone.clone();
            async_std::task::block_on(
                machine.call(CompileInternalMacro(internal_macro))
            )?
        };

        let annotated_gcodes = compile_macros(
            gcodes,
            compile_internal_macro,
        );

        let mut gcodes = vec![];
        let mut annotations = vec![];

        for item in annotated_gcodes {
            match item? {
                AnnotatedGCode::GCode(gcode) => {
                    gcodes.push(gcode);
                }
                AnnotatedGCode::Annotation(annotation) => {
                    annotations.push(annotation);
                }
            };
        };

        Result::<_>::Ok((gcodes, annotations))
    }).await?;

    /*
    * Create the task
    * =========================================================================================
    */
    let total_lines = gcodes.len() as u64;

    let task = Task {
        id: nanoid!(11),
        version: 0,
        created_at: Utc::now(),
        deleted_at: None,
        machine_id: machine_id.clone(),
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
