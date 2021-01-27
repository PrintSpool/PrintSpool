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
use teg_machine::task::Task;
use teg_json_store::{ Record as _, JsonRow };

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

    async fn tasks<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Vec<Task>> {
        let db: &crate::Db = ctx.data()?;

        let tasks = sqlx::query_as!(
            JsonRow,
            r#"
                SELECT props FROM tasks
                WHERE
                    part_id = ?
            "#,
            self.id,
        )
            .fetch_all(db)
            .await?;

        let tasks = Task::from_rows(tasks)?;
        Ok(tasks)
    }
}
