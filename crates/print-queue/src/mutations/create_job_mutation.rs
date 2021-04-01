use std::convert::TryInto;

use chrono::prelude::*;
use futures::future::try_join_all;
use async_std::prelude::*;
use async_std::{
    fs::{ self, File },
};
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use eyre::{
    // eyre,
    // Result,
    Context as _,
};
use teg_json_store::Record;

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
    #[graphql(name="printQueueID")]
    print_queue_id: ID,
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

        let print_queue = PrintQueue::get(
            db,
            &input.print_queue_id,
            false,
        ).await?;
        let print_queue_id = print_queue.id;

        let package = Package::new(
            print_queue_id.clone(),
            input.name,
            1,
        );
        let package_id = package.id.clone();

        let parts = input.parts
            .into_iter()
            .enumerate()
            .map(move |(index, part_input)| {
                let package_id = package_id.clone();

                async move {
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
                        deleted_at: None,
                        package_id,
                        name: part_input.name,
                        position: index as u64,
                        quantity: 1,
                        file_path,
                    };

                    Ok(part) as eyre::Result<Part>
                }
            });

        let parts = try_join_all(parts).await?;

        let mut tx = db.begin().await?;
        let max_position: Vec<u8> = sqlx::query!(
            r#"
                SELECT CAST(MAX(position) AS BLOB) AS position FROM parts
                INNER JOIN packages ON packages.id = parts.package_id
                WHERE
                    packages.print_queue_id = ?
                    AND packages.deleted_at IS NULL
            "#,
            print_queue_id
        )
            .fetch_optional(&mut tx)
            .await?
            .and_then(|row| row.position)
            .unwrap_or_else(|| { 0u64.to_be_bytes().into() });

        let first_available_position = u64::from_be_bytes(max_position[..].try_into()?) + 1;

        package.insert_no_rollback(&mut tx).await?;
        for mut part in parts {
            part.position += first_available_position;
            part.insert_no_rollback(&mut tx).await?;
        }
        tx.commit().await?;

        Ok(package)
    }
}
