use async_graphql::{
    ID,
    FieldResult,
    Context,
};
// use anyhow::{
//     // anyhow,
//     Result,
//     // Context as _,
// };

use crate::{
    part::Part,
};

#[async_graphql::Object]
impl Part {
    async fn id(&self) -> ID { (&self.id).into() }
    async fn name(&self) -> &String { &self.name }
    async fn quantity(&self) -> i32 { self.quantity }

    async fn total_prints_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<i64> {
        let db: &crate::Db = ctx.data()?;

        Ok(Self::query_total_prints(db, &self.id).await?)
    }

    async fn prints_completed<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<i32> {
        let db: &crate::Db = ctx.data()?;

        Ok(Self::query_prints_completed(db, &self.id).await?)
    }

    async fn is_done_<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<bool> {
        let db: &crate::Db = ctx.data()?;

        Ok(Self::is_done(db, &self.id).await?)
    }
}