use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use chrono::prelude::*;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_json_store::{
    Record as _,
};

use crate::{package::Package, part::{Part, PartTemplate}};

#[derive(Default)]
pub struct StarMutations;

#[derive(async_graphql::InputObject, Debug)]
struct SetStarredInput {
    #[graphql(name="packageID")]
    package_id: ID,
    starred: bool
}

#[async_graphql::Object]
impl StarMutations {
    /// Save a package for later prints
    async fn set_starred<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: SetStarredInput,
    ) -> FieldResult<Package> {
        let db: &crate::Db = ctx.data()?;
        async move {
            let mut tx = db.begin().await?;

            let mut original_pkg = Package::get(
                &mut tx,
                &input.package_id.0,
                false,
            )
                .await?;

            let mut parent_pkg = if let
                Some(parent_id) = original_pkg.based_on_package_id.as_ref()
            {
                Package::get_optional(
                    &mut tx,
                    &parent_id,
                    false,
                )
                    .await?
            } else {
                None
            };

            let root_pkg = parent_pkg
                .as_mut()
                .or_else(|| {
                    if original_pkg.starred {
                        Some(&mut original_pkg)
                    } else {
                        None
                    }
                });

            match root_pkg {
                Some(mut root_pkg) if !input.starred => {
                    root_pkg.starred = false;

                    root_pkg.update(&mut tx).await?;
                }
                None | Some(Package { starred: false, .. }) if input.starred => {
                    // Copy the package properties to a new starred package
                    let mut starred_package = Package::new(
                        original_pkg.print_queue_id.clone(),
                        None,
                        original_pkg.name.clone(),
                        // A quantity of 0 prevents this starred copy from showing up in
                        // the print queue
                        0,
                    );
                    starred_package.starred = true;
                    starred_package.insert_no_rollback(&mut tx).await?;
 
                    // Update the original package parent
                    original_pkg.based_on_package_id = Some(starred_package.id.clone());
                    original_pkg.update(&mut tx).await?;

                    let original_parts = Package::get_parts(
                        &mut tx,
                        &original_pkg.id
                    ).await?;

                    for (index, mut original_part) in original_parts
                        .into_iter()
                        .enumerate()
                    {
                        // copy the original part's properties to a new starred part
                        let starred_part = Part {
                            id: nanoid!(11),
                            version: 0,
                            created_at: Utc::now(),
                            deleted_at: None,
                            package_id: starred_package.id.clone(),
                            name: original_part.name.clone(),
                            position: index as u64,
                            quantity: original_part.quantity,
                            file_path: original_part.file_path.clone(),
                            based_on: None,
                        };

                        starred_part.insert_no_rollback(&mut tx).await?;

                        // set the original part parent ids to the starred part and package
                        original_part.based_on = Some(PartTemplate {
                            part_id: starred_part.id,
                            package_id: starred_package.id.clone(),
                        });
                        original_part.update(&mut tx).await?;
                    }
                }
                // Idempotent - already starred or unstarred packages are left unchanged
                _ => {}
            }

            tx.commit().await?;

            Result::<_>::Ok(original_pkg)
        }
            // log the backtrace which is otherwise lost by FieldResult
            .await
            .map_err(|err| {
                warn!("{:?}", err);
                err.into()
            })
    }
}
