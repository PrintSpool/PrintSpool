use async_graphql::{
    Context,
    ID,
    FieldResult,
};
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use printspool_json_store::{ Record as _, JsonRow };

use crate::part::Part;

#[derive(async_graphql::InputObject, Debug, Default)]
struct PartsInput {
    /// Optional filter: Return only the one part or error if it doesn't exist
    #[graphql(name="partID")]
    part_id: Option<ID>,
}

#[derive(Default)]
pub struct PartQuery;

#[async_graphql::Object]
impl PartQuery {
    #[instrument(skip(self, ctx))]
    async fn parts<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        #[graphql(default)]
        input: PartsInput,
    ) -> FieldResult<Vec<Part>> {
        let db: &crate::Db = ctx.data()?;

        async move {
            let mut parts = if let Some(part_id) = input.part_id {
                let part = sqlx::query_as!(
                    JsonRow,
                    r#"
                        SELECT parts.props FROM parts
                        WHERE
                            parts.id = $1
                    "#,
                    part_id.0,
                )
                    .fetch_one(db)
                    .await?;

                vec![Part::from_row(part)?]
            } else {
                let parts = sqlx::query_as!(
                    JsonRow,
                    r#"
                        SELECT parts.props FROM parts
                        WHERE
                            parts.deleted_at IS NULL
                    "#,
                )
                    .fetch_all(db)
                    .await?;

                Part::from_rows(parts)?
            };

            // Consistent ordering
            parts.sort_by_cached_key(|p| p.id.clone());

            Result::<_>::Ok(parts)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
