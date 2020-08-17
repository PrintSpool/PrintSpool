use std::sync::Arc;
use chrono::prelude::*;
use async_graphql::*;

use super::models::{
    Task,
    TaskStatus,
    Part,
};

use crate::machine::models::{
    Machine,
};

use crate::models::{
    VersionedModel,
    // VersionedModelError,
};

/// A spooled set of gcodes to be executed by the machine
#[Object]
impl Task {
    async fn id(&self) -> ID { self.id.into() }

    async fn name<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<String> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        if let Some(print) = self.print.as_ref() {
            let part = Part::get(&ctx.db, print.part_id)?;

            Ok(part.name.to_string())
        } else {
            Ok("[UNNAMED_TASK]".to_string())
        }
    }

    async fn status(&self) -> &TaskStatus { &self.status }

    // TODO: rename field to match model
    async fn total_line_numbers(&self) -> u64 { self.total_lines }
    // TODO: rename field to match model
    async fn current_line_number(&self) -> &Option<u64> { &self.despooled_line_number }

    async fn percent_complete(
        &self,
        /// The number of digits to the right of the decimal place to round to. eg.
        ///   `percent_complete(digits: 0)` gives 3%
        ///   `percent_complete(digits: 2)` gives 3.14%
        digits: Option<u8>,
    ) -> FieldResult<f32> {
        let printed_lines = self.despooled_line_number
            .map(|n| n + 1)
            .unwrap_or(0);

        let percent = (printed_lines / self.total_lines) as f32;

        if let Some(digits) = digits {
            let scale = 10f32.powi(digits as i32);
            Ok((percent * scale).round() / scale)
        } else {
            Ok(percent)
        }
    }

    async fn created_at(&self) -> &DateTime<Utc> { &self.created_at }

    async fn machine<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Machine> {
        let ctx: &Arc<crate::Context> = ctx.data()?;

        let machine = Machine::get(&ctx.db, self.machine_id)?;

        Ok(machine)
    }
}
