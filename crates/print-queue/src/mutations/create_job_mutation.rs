// use std::collections::HashMap;
// use chrono::prelude::*;
use futures::future::try_join_all;
use async_std::prelude::*;
use async_std::{
    fs::{ self, File },
};
use std::sync::Arc;
use async_graphql::{
    ID,
    FieldResult,
};
// use serde::{Deserialize, Serialize};
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};

use crate::{
    // Task,
    // Print,
    // TaskStatus,
    // TaskContent,
    PrintQueue,
    part::Part,
    package::Package,
};
// use crate::machine::models::{
//     Machine,
//     MachineStatus,
//     Printing,
// };

#[derive(Default)]
pub struct CreateJobMutation;

#[derive(async_graphql::InputObject)]
struct CreateJobInput {
    name: String,
    print_queue_id: ID,
    // TODO: update graphql names to match latest Sled fields
    #[graphql(name="files")]
    parts: Vec<PartInput>,
}

#[derive(async_graphql::InputObject)]
struct PartInput {
    name: String,
    content: String,
}

#[async_graphql::Object]
impl CreateJobMutation {
    /// create a Job from the content and fileName of a file upload.
    async fn create_job<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: CreateJobInput,
    ) -> FieldResult<Package> {
        let db: &crate::Db = ctx.data()?;

        let part_dir = "/var/lib/teg/parts";
        fs::create_dir_all(part_dir).await?;

        let print_queue = PrintQueue::get(&db, &input.print_queue_id).await?;
        let print_queue_id = print_queue.id;
        let package_id = nanoid!();

        let package = Package::new(
            package_id,
            input.name,
        );

        let next_position = Part::scan(&db)
            .filter(|part| {
                if let Ok(part) = part {
                    part.print_queue_id == print_queue.id
                } else {
                    true
                }
            })
            .collect::<Result<Vec<Part>>>()?
            .len();

        let parts = input.parts
            .into_iter()
            .enumerate()
            .map(|(index, part_input)| async move {
                let part_id = db.generate_id()
                    .with_context(|| "Could not generate id for uploaded part")?;
                let file_path = format!("{}/part_{}.gcode", part_dir, part_id.to_string());

                let mut file = File::create(&file_path).await
                    .with_context(|| "Could not create file for gcode. May be out of disk space")?;
                file.write_all(&part_input.content.as_bytes()).await?;
                file.flush().await?;

                let part = Part::new(
                    part_id,
                    print_queue_id,
                    package_id,
                    part_input.name,
                    (next_position + index) as u64,
                    file_path,
                );

                Ok(part) as anyhow::Result<Part>
            });

        let parts = try_join_all(parts).await?;

        db.transaction(|db| {
            package.clone().insert(&db)?;
            for part in parts.iter() {
                part.clone().insert(&db)?;
            }

            Ok(())
        })?;

        db.flush_async().await
            .with_context(|| "Error saving job to the database")?;

        Ok(package)
    }
}
