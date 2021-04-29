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
use teg_json_store::{ Record, JsonRow };

use crate::{
    PrintQueue,
    part::Part,
    // package::Package,
};

#[derive(async_graphql::InputObject, Default)]
struct PrintQueuePartsInput {
    /// Include the prints that are currently in the queue or actively printing (default: true)
    #[graphql(default = true)]
    include_queued: bool,
    /// Include the print history of parts that have completed all of their prints (default: false)
    #[graphql(default = false)]
    include_finished: bool,
    /// Include starred prints regardless of whether they are in the queue or finished
    /// (default: false)
    #[graphql(default = false)]
    include_starred: bool,
}

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
        input: Option<PrintQueuePartsInput>,
    ) -> FieldResult<Vec<Part>> {
        let db: &crate::Db = ctx.data()?;

        let input = input.unwrap_or(PrintQueuePartsInput {
            include_queued: true,
            include_finished: false,
            include_starred: false,
        });

        let parts = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT
                    parts.props
                FROM parts
                INNER JOIN packages ON
                    packages.id = parts.package_id
                    AND packages.print_queue_id = ?
                OUTER LEFT JOIN tasks ON
                    tasks.part_id = parts.id
                    AND tasks.status = 'finished'
                WHERE
                    parts.deleted_at IS NULL
                    AND (tasks.id IS NULL OR tasks.status IS NOT NULL)
                GROUP BY
                    parts.id
                HAVING
                    (
                        ? IS TRUE
                        AND parts.quantity * packages.quantity > COUNT(tasks.id)
                    )
                    OR
                    (
                        ? IS TRUE
                        AND parts.quantity * packages.quantity <= COUNT(tasks.id)
                    )
                    OR
                    (
                        ? IS TRUE
                        AND packages.starred
                    )
                ORDER BY parts.position
            "#,
            self.id,
            input.include_queued,
            input.include_finished,
            input.include_starred,
        )
            .fetch_all(db)
            .await?;

        let parts = Part::from_rows(parts)?;

        Ok(parts)
    }
}
