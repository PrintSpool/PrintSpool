use async_graphql::{
    ID,
    Context,
    FieldResult,
};
use async_graphql::validators::{IntGreaterThan};
// use eyre::{
//     eyre,
//     // Result,
//     // Context as _,
// };
use teg_json_store::{
    Record,
};

use crate::{
    part::Part,
};

#[derive(Default)]
pub struct SetPartQuantityMutation;

#[derive(async_graphql::InputObject, Debug)]
struct SetPartQuantityInput {
    #[graphql(name="partID")]
    part_id: ID,
    #[graphql(validator(
        IntGreaterThan(value = "0")
    ))]
    quantity: i32,
}

#[async_graphql::Object]
impl SetPartQuantityMutation {
    /// Move a job in the print queue
    async fn set_part_quantity<'ctx>(
        &self,
        ctx: &'ctx Context<'_>,
        input: SetPartQuantityInput,
    ) -> FieldResult<Part> {
        let db: &crate::Db = ctx.data()?;
        let mut tx = db.begin().await?;

        let mut part = Part::get(&mut tx, &input.part_id.0)
            .await?;

        part.quantity = input.quantity;

        part.update(&mut tx).await?;

        tx.commit().await?;

        Ok(part)
    }
}
