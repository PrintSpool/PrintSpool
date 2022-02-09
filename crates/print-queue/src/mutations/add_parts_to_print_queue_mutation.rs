use std::os::unix::io::AsRawFd;
use chrono::prelude::*;
use futures::{future::try_join_all};
// use async_std::prelude::*;
use async_std::{
    fs,
};
use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use printspool_json_store::Record;

use crate::{
    PrintQueue,
    part::{ Part, PartTemplate },
    package::Package,
};

#[derive(Default)]
pub struct AddPartsToPrintQueueMutation;

#[derive(async_graphql::InputObject)]
/// Adds a new package to the queue from the array of uploaded parts.
struct AddPartsToPrintQueueInput {
    name: String,
    #[graphql(name="printQueueID")]
    print_queue_id: ID,
    parts: Vec<AddPartsToPrintQueuePartInput>,
}

#[derive(async_graphql::InputObject)]
struct AddPartsToPrintQueuePartInput {
    name: String,
    // content: String,
    file: async_graphql::Upload,
    quantity: u32,
}

#[derive(async_graphql::InputObject)]
/// Adds a clone of the starred package's parts to the print queue
struct AddStarredPackagesToPrintQueueInput {
    #[graphql(name="packageIDs")]
    package_ids: Vec<ID>,
}

async fn add_to_print_queue(
    db: &crate::Db,
    start: std::time::Instant,
    package: Package,
    parts: Vec<Part>,
) -> Result<Package> {
    let mut tx = db.begin().await?;
    let max_position = sqlx::query!(
        r#"
            SELECT position FROM parts
            INNER JOIN packages ON packages.id = parts.package_id
            WHERE
                packages.print_queue_id = $1
                AND packages.deleted_at IS NULL
            ORDER BY position DESC
            LIMIT 1
        "#,
        package.print_queue_id
    )
        .fetch_optional(&mut tx)
        .await?
        .map(|row| row.position);

    let first_available_position = max_position.unwrap_or(-1i64) + 1;

    package.insert_no_rollback(&mut tx).await?;
    for mut part in parts {
        part.position += first_available_position;
        part.insert_no_rollback(&mut tx).await?;
    }
    tx.commit().await?;

    info!(
        "Saved new parts to database and file system in: {:?}",
        start.elapsed(),
    );

    Ok(package)
}

#[async_graphql::Object]
impl AddPartsToPrintQueueMutation {
    /// create a Package of parts for printing from the content and fileName of a file upload.
    async fn add_parts_to_print_queue<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: AddPartsToPrintQueueInput,
    ) -> FieldResult<Package> {
        let start = std::time::Instant::now();

        let db: &crate::Db = ctx.data()?;

        async move {
            let part_dir = crate::paths::var().join("parts");
            fs::create_dir_all(&part_dir).await?;

            let print_queue = PrintQueue::get(
                db,
                &input.print_queue_id,
                false,
            ).await?;

            let package = Package::new(
                print_queue.id.clone(),
                None,
                input.name,
                1,
            );
            let package_id = package.id.clone();

            // Create parts from the uploaded files
            let parts = input.parts
                .into_iter()
                .enumerate()
                .map(move |(index, part_input)| {
                    let package_id = package_id.clone();
                    let part_dir = part_dir.clone();

                    async move {
                        let part_id = nanoid!(11);
                        let file_path = part_dir.clone().join(format!(
                            "part_{}.gcode",
                            part_id.to_string(),
                        )).into_os_string().into_string().unwrap();

                        let tmp_file = part_input.file.value(&ctx)?.content;

                        // From open(2) a tempfile can be persisted using:
                        //
                        // snprintf(path, PATH_MAX,  "/proc/self/fd/%d", fd);
                        // linkat(AT_FDCWD, path, AT_FDCWD, "/path/for/file", AT_SYMLINK_FOLLOW);

                        let tmp_file_path = format!("/proc/self/fd/{}", tmp_file.as_raw_fd());

                        nix::unistd::linkat(
                            None,
                            &tmp_file_path[..],
                            None,
                            &file_path[..],
                            nix::unistd::LinkatFlags::SymlinkFollow,
                        )?;

                        let part = Part {
                            id: part_id,
                            version: 0,
                            created_at: Utc::now(),
                            deleted_at: None,
                            package_id,
                            name: part_input.name,
                            position: index as i64,
                            quantity: part_input.quantity as i32,
                            file_path,
                            based_on: None,
                        };

                        Ok(part) as eyre::Result<Part>
                    }
                });

            let parts = try_join_all(parts).await?;

            add_to_print_queue(db, start, package, parts).await
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }

    /// Copy the parts from a starred package into a new package in the print queue
    async fn add_starred_packages_to_print_queue<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: AddStarredPackagesToPrintQueueInput,
    ) -> FieldResult<Vec<Package>> {
        let start = std::time::Instant::now();

        let db: &crate::Db = ctx.data()?;

        async move {
            let part_dir = crate::paths::var().join("parts");
            fs::create_dir_all(part_dir).await?;

            let pkg_template_ids = input.package_ids
                .into_iter()
                .map(|id| id.0)
                .collect::<Vec<_>>();

            let pkg_templates = Package::get_by_ids(
                db,
                &pkg_template_ids,
                false,
            ).await?;

            let packages = pkg_templates
                .into_iter()
                .map(|pkg_template| async move {
                    let db = db.clone();
                    if !pkg_template.starred {
                        return Err(eyre!("Package must be starred"));
                    }

                    let print_queue = PrintQueue::get(
                        &db,
                        &pkg_template.print_queue_id,
                        false,
                    ).await?;

                    let package = Package::new(
                        print_queue.id.clone(),
                        Some(pkg_template.id.clone()),
                        pkg_template.name.clone(),
                        1,
                    );
                    let package_id = package.id.clone();

                    let part_templates = Package::get_parts(
                        &db,
                        &pkg_template.id
                    ).await?;

                    let parts = part_templates
                        .into_iter()
                        .enumerate()
                        .map(|(index, part_template)| {
                            let package_id = package_id.clone();
                            Part {
                                id: nanoid!(11),
                                version: 0,
                                created_at: Utc::now(),
                                deleted_at: None,
                                package_id,
                                name: part_template.name,
                                position: index as i64,
                                quantity: part_template.quantity,
                                file_path: part_template.file_path,
                                based_on: Some(PartTemplate {
                                    part_id: part_template.id,
                                    package_id: pkg_template.id.clone(),
                                }),
                            }
                        })
                        .collect::<Vec<_>>();

                    add_to_print_queue(&db, start, package, parts).await
                });

                Result::<_>::Ok(try_join_all(packages).await?)
        }
            // log the backtrace which is otherwise lost by FieldResult
            .await
            .map_err(|err| {
                warn!("{:?}", err);
                err.into()
            })
    }
}
