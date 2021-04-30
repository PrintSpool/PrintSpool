use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};
use teg_json_store::{
    Record as _,
};

use crate::{
    package::Package,
};

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
                let parent_pkg = Package::get(
                    &mut tx,
                    &parent_id,
                    false,
                )
                    .await?;

                Some(parent_pkg)
            } else {
                None
            };
            let root_pkg = parent_pkg.as_mut().unwrap_or(&mut original_pkg);

            root_pkg.starred = input.starred;

            root_pkg.update(&mut tx).await?;

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

    // /// Un-star a package.
    // // TODO: /// This will delete the associated GCode files once the last print is completed.
    // async fn unstar_package<'ctx>(
    //     &self,
    //     ctx: &'ctx Context<'_>,
    //     input: UnstarPackageInput,
    // ) -> FieldResult<Package> {
    //     let db: &crate::Db = ctx.data()?;
    //     let mut tx = db.begin().await?;

    //     let mut original_pkg = Package::get(
    //         &mut tx,
    //         &input.package_id.0,
    //         false,
    //     )
    //         .await?;

    //     let mut parent_pkg = if let
    //         Some(parent_id) = original_pkg.based_on_package_id.as_ref()
    //     {
    //         let parent_pkg = Package::get(
    //             &mut tx,
    //             &parent_id,
    //             false,
    //         )
    //             .await?;

    //         Some(parent_pkg)
    //     } else {
    //         None
    //     };
    //     let root_pkg = parent_pkg.as_mut().unwrap_or(&mut original_pkg);

    //     root_pkg.starred = false;

    //     root_pkg.update(&mut tx).await?;

    //     tx.commit().await?;

    //     Ok(original_pkg)
    // }
}
