// use chrono::prelude::*;
use futures::future::try_join_all;
use async_std::prelude::*;
use async_std::{
    fs::{ self, File },
};
use std::sync::Arc;
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};

use crate::{
    PrintQueue,
    part::Part,
    package::Package,
};

#[derive(Default)]
pub struct CreateJobMutation;

#[derive(async_graphql::InputObject)]
struct CreateJobInput {
    name: String,
    print_queue_id: ID,
    // TODO: update graphql names to match latest fields
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
        ctx: &'ctx Context<'_>,
        input: CreateJobInput,
    ) -> FieldResult<Package> {
        let db: &crate::Db = ctx.data()?;

        let part_dir = "/var/lib/teg/parts";
        fs::create_dir_all(part_dir).await?;

        let print_queue = PrintQueue::get(&db, &input.print_queue_id).await?;
        let print_queue_id = print_queue.id;
        let package_id = nanoid!(11);

        let package = Package::new(
            package_id,
            input.name,
        );

        let next_position = sqlite::query!(
            r#"
                SELECT MAX(position) + 1 FROM parts
                INNER JOIN packages ON packages.id = parts.id
                WHERE packages.print_queue_id = ?
            "#,
            print_queue_id
        )
            .fetch_scalar(&db)
            .await;

        let parts = input.parts
            .into_iter()
            .enumerate()
            .map(|(index, part_input)| async move {
                let part_id = nanoid!(11);
                let file_path = format!("{}/part_{}.gcode", part_dir, part_id.to_string());

                let mut file = File::create(&file_path).await
                    .with_context(|| "Could not create file for gcode. May be out of disk space")?;
                file.write_all(&part_input.content.as_bytes()).await?;
                file.flush().await?;

                let part = Part {
                    id: part_id,
                    version: 0,
                    created_at: Utc::now(),
                    package_id,
                    name: part_input.name,
                    position: next_position + (index as u64),
                    quantity: 1,
                    file_path,
                };

                Ok(part) as anyhow::Result<Part>
            });

        let parts = try_join_all(parts).await?;

        let mut tx = db.begin().await?;
        package.insert(&mut tx).await?;
        for part in parts.iter() {
            part.insert(&mut tx).await?;
        }
        tx.commit().await?;

        Ok(package)
    }
}
