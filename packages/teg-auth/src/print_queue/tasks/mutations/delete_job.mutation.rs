// use std::collections::HashMap;
// use chrono::prelude::*;
// use futures::prelude::*;
use futures::future::try_join_all;
use async_std::{
    fs,
};

use std::sync::Arc;
use async_graphql::{
    ID,
    InputObject,
    Object,
    FieldResult,
};
// use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
    VersionedModelResult,
};
use crate::print_queue::tasks::{
    Task,
    // Print,
    // TaskStatus,
    TaskContent,
    Part,
    Package,
};
// use crate::machine::models::{
//     Machine,
//     MachineStatus,
//     Printing,
// };

pub struct DeleteJobMutation;

#[InputObject]
struct DeleteJobInput {
    // TODO: update graphql names to match latest Sled fields
    #[field(name="jobID")]
    package_id: ID,
}

#[InputObject]
struct PartInput {
    name: String,
    content: String,
}

#[Object]
impl DeleteJobMutation {
    /// create a Job from the content and fileName of a file upload.
    async fn delete_job<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: DeleteJobInput,
    ) -> FieldResult<Option<bool>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let package_id = input.package_id.parse::<u64>()
            .with_context(|| format!("Invalid package id: {:?}", input.package_id))?;

        // TODO: Not part of the transaction. Entries may be added or removed. Consider adding
        // indexes to parent type
        let part_ids: Vec<u64> = Part::scan(&ctx.db)
            .filter_map(|part|
                match part {
                    Ok(part) if part.package_id == package_id => {
                        Some(Ok(part.id))
                    }
                    Err(err) => {
                        Some(Err(err))
                    }
                    _ => None
                }
            )
            .collect::<Result<Vec<u64>>>()?;

        // TODO: Not part of the transaction. Entries may be added or removed. Consider adding
        // indexes to parent type
        let task_ids: Vec<u64> = Part::scan(&ctx.db)
            .filter_map(|task|
                match task {
                    Ok(task) if task.package_id == package_id => {
                        Some(Ok(task.id))
                    }
                    Err(err) => {
                        Some(Err(err))
                    }
                    _ => None
                }
            )
            .collect::<Result<Vec<u64>>>()?;

        let (parts, tasks): (Vec<Part>, Vec<Task>) = ctx.db.transaction(|db| {
            Package::remove(&db, package_id)?;

            let parts= part_ids.clone()
                .iter()
                .filter_map(|part_id| Part::remove(&db, *part_id).transpose())
                .collect::<VersionedModelResult<Vec<Part>>>()?;

            let tasks= task_ids.clone()
                .iter()
                .filter_map(|task_id| Task::remove(&db, *task_id).transpose())
                .collect::<VersionedModelResult<Vec<Task>>>()?;

            Ok((parts, tasks))
        })?;

        let part_files: Vec<String> = parts.into_iter()
            .map(|part| part.file_path)
            .collect();

        let task_files = tasks.into_iter()
            .filter_map(|task| {
                if let TaskContent::FilePath(file_path) = task.content {
                    Some(file_path)
                } else {
                    None
                }
            }).collect();

        let files = [part_files, task_files].concat();

        let delete_files = files
            .into_iter()
            .map(fs::remove_file);

        try_join_all(delete_files).await?;

        ctx.db.flush_async().await
            .with_context(|| "Error saving job to the database")?;

        Ok(None)
    }
}
