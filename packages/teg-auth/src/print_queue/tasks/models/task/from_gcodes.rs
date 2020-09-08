use std::sync::Arc;
use futures::prelude::*;
use futures::stream::{StreamExt};
// use std::collections::HashMap;
use async_graphql::*;
use anyhow::{
    Result,
    // anyhow,
    // Context as _,
};

use crate::models::{
    VersionedModel,
};
use crate::{
    // Machine,
    // MachineStatus,
    print_queue::macros::{
        compile_macros,
        AnnotatedGCode,
    },
};

use super::{
    Task,
    TaskContent,
};

impl Task {
    pub async fn from_hook<'ctx>(
        machine_id: u64,
        hook: &String,
        ctx: &'ctx Arc<crate::Context>,
    ) -> Result<Task> {
        Task::from_gcodes(
            machine_id,
            hook.lines().map(String::from).collect(),
            ctx,
        ).await
    }

    pub async fn from_gcodes<'ctx>(
        machine_id: u64,
        gcodes: Vec<String>,
        ctx: &'ctx Arc<crate::Context>,
    ) -> Result<Task> {
        /*
        * Preprocess GCodes
        * =========================================================================================
        */
        let gcodes = stream::iter(gcodes)
            .map(|gcode| Ok(gcode));

        // Add annotations
        let annotated_gcodes = compile_macros(
            Arc::clone(ctx),
            gcodes,
        );

        let (gcodes, annotations) = annotated_gcodes
            .try_fold((vec![], vec![]), |mut acc, item| {
                let (
                    gcodes,
                    annotations,
                ) = &mut acc;

                match item {
                    AnnotatedGCode::GCode(gcode) => {
                        gcodes.push(gcode);
                    }
                    AnnotatedGCode::Annotation(annotation) => {
                        annotations.push(annotation);
                    }
                };

                future::ok(acc)
            })
            .await?;

        /*
        * Create the task
        * =========================================================================================
        */
        let gcodes = gcodes;
        let total_lines = gcodes.len() as u64;

        let mut task = Task::new(
            Task::generate_id(&ctx.db)?,
            machine_id,
            TaskContent::GCodes(gcodes),
            annotations,
            total_lines,
        );

        Ok(task)
    }
}
