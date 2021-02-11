use async_graphql::{
    ID,
    Context,
    FieldResult,
};
// use eyre::{
//     eyre,
//     // Result,
//     Context as _,
// };
// use teg_json_store::{ Record, JsonRow };

use crate::{
    PrintQueue,
    part::Part,
    // package::Package,
};

#[async_graphql::Object]
impl PrintQueue {
    async fn id(&self) -> ID { (&self.id).into() }

    async fn name<'ctx>(&self) -> &String {
        &self.name
    }

    async fn parts<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        // id: Option<ID>,
    ) -> FieldResult<Vec<Part>> {
        let db: &crate::Db = ctx.data()?;

        // let parts = if let Some(id) = id {
        //     let id = id.to_string();

        //     let part = sqlx::query_as!(
        //         JsonRow,
        //         r#"
        //             SELECT parts.props FROM parts
        //             INNER JOIN packages ON packages.id = parts.package_id
        //             WHERE
        //                 packages.print_queue_id = ?
        //                 AND parts.deleted_at IS NULL
        //                 AND parts.id = ?
        //         "#,
        //         self.id,
        //         id,
        //     )
        //         .fetch_one(db)
        //         .await?;

        //     let part = Part::from_row(part)?;

        //     vec![part]
        // } else {
        let parts = PrintQueue::get_parts(db, &self.id).await?;
        // };

        Ok(parts)
    }
}
