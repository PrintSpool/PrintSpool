use std::sync::Arc;
use async_graphql::{
    ID,
    InputObject,
    Object,
    FieldResult,
};
// use serde::{Deserialize, Serialize};
use anyhow::{
    anyhow,
    Result,
    Context as _,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
    // VersionedModelResult,
};
use crate::print_queue::tasks::{
    Part,
};
// use crate::machine::models::{
//     Machine,
//     MachineStatus,
//     Printing,
// };

#[derive(Default)]
pub struct SetJobPositionMutation;

#[InputObject]
struct SetJobPositionInput {
    // TODO: update graphql names to match latest Sled fields
    #[field(name="jobID")]
    package_id: ID,
    position: u64,
}

#[InputObject]
struct PartInput {
    name: String,
    content: String,
}

#[Object]
impl SetJobPositionMutation {
    /// Move a job in the print queue
    async fn set_job_position<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: SetJobPositionInput,
    ) -> FieldResult<Option<bool>> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let package_id = input.package_id.parse::<u64>()
            .with_context(|| format!("Invalid package id: {:?}", input.package_id))?;

        // TODO: This mutation will need to be updated to be based on part IDs
        //
        // TODO: Not part of the transaction. Entries may be added or removed. Consider adding
        // indexes to parent type
        let parts = Part::scan(&ctx.db).collect::<Result<Vec<Part>>>()?;

        let moved_part = parts.iter()
            .find(|part| part.package_id == package_id)
            .ok_or_else(|| anyhow!("Part not found in job queue"))?;

        let previous_moved_part_position = moved_part.position;
        let next_moved_part_position = input.position;

        ctx.db.transaction(|db| {
            let moved_part = moved_part.clone();

            for mut part in parts.clone() {
                let mut next_position = part.position;
                if next_position > previous_moved_part_position {
                    next_position -= 1;
                }
                if next_position >= next_moved_part_position {
                    next_position += 1;
                }
                if part.id == moved_part.id {
                    next_position = next_moved_part_position;
                }
                if next_position != part.position {
                    part.position = next_position;
                    part.insert(&db)?;
                }
            }

            Ok(())
        })?;

        ctx.db.flush_async().await
            .with_context(|| "Error saving job to the database")?;

        Ok(None)
    }
}
