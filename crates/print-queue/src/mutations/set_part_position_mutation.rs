use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use eyre::{
    eyre,
    // Result,
    // Context as _,
};
use teg_json_store::{
    Record,
    JsonRow,
};

use crate::{
    part::Part,
};

#[derive(Default)]
pub struct SetPartPositionMutation;

#[derive(async_graphql::InputObject, Debug)]
struct SetPartPositionInput {
    // TODO: update graphql names to match latest Sled fields
    #[graphql(name="partID")]
    part_id: ID,
    position: u64,
}

#[async_graphql::Object]
impl SetPartPositionMutation {
    /// Move a job in the print queue
    async fn set_job_position<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: SetPartPositionInput,
    ) -> FieldResult<Option<bool>> {
        let db: &crate::Db = ctx.data()?;
        let mut tx = db.begin().await?;

        let part_id = input.part_id.to_string();

        let parts = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM parts
                WHERE
                    deleted_at IS NULL
                ORDER BY
                    position
            "#,
        )
            .fetch_all(&mut tx)
            .await?;

        let parts = Part::from_rows(parts)?;

        let moved_part = parts.iter()
            .find(|part| part.id == part_id)
            .ok_or_else(|| eyre!("Part not found in job queue"))?;

        let previous_moved_part_position = moved_part.position;
        let next_moved_part_position = input.position;

        let moved_part = moved_part.clone();

        for mut part in parts.clone() {
            let previous_position = part.position;

            // Move bumped parts
            if part.position > previous_moved_part_position {
                part.position -= 1;
            }
            if part.position >= next_moved_part_position {
                part.position += 1;
            }

            // Move the target part
            if part.id == moved_part.id {
                part.position = next_moved_part_position;
            }

            // Update the database
            if part.position != previous_position {
                part.update(&mut tx).await?;
            }
        }

        tx.commit().await?;

        Ok(None)
    }
}
