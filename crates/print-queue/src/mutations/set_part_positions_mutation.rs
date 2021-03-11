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
pub struct SetPartPositionsMutation;

#[derive(async_graphql::InputObject, Debug)]
struct SetPartPositionsInput {
    parts: Vec<SetPartPositionsInputPart>,
}

#[derive(async_graphql::InputObject, Debug)]
struct SetPartPositionsInputPart {
    #[graphql(name="partID")]
    part_id: ID,
    position: u64,
}

#[async_graphql::Object]
impl SetPartPositionsMutation {
    /// Move a job in the print queue
    async fn set_part_positions<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: SetPartPositionsInput,
    ) -> FieldResult<Option<teg_common::Void>> {
        let db: &crate::Db = ctx.data()?;
        let mut tx = db.begin().await?;

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

        let mut parts = Part::from_rows(parts)?;

        let original_positions = parts
            .iter()
            .map(|part| part.position)
            .collect::<Vec<_>>();

        for SetPartPositionsInputPart {
            part_id: moved_part_id,
            position: next_moved_part_position,
        } in input.parts {
            let moved_part = parts.iter()
                .find(|part| part.id == moved_part_id.0)
                .ok_or_else(|| eyre!("Part not found in job queue"))?;

            let previous_moved_part_position = moved_part.position;

            for mut part in parts.iter_mut() {
                // Move bumped parts
                if part.position > previous_moved_part_position {
                    part.position -= 1;
                }
                if part.position >= next_moved_part_position {
                    part.position += 1;
                }

                // Move the target part
                if part.id == moved_part_id.0 {
                    part.position = next_moved_part_position;
                }
            }
        }

        for (mut part, original_position) in parts.into_iter().zip(original_positions) {
            // Update the database
            if part.position != original_position {
                part.update(&mut tx).await?;
            }
        }

        tx.commit().await?;

        Ok(None)
    }
}
