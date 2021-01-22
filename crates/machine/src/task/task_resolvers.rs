use chrono::prelude::*;
use async_graphql::{ FieldResult, ID, Context };
use anyhow::{
    anyhow,
    // Result,
    // Context as _,
};

use super::{Task, TaskStatus, task_status::TaskStatusGQL};

use crate::{MachineMap, machine::{
    MachineData,
    messages::GetData,
}};

/// A spooled set of gcodes to be executed by the machine
#[async_graphql::Object]
impl Task {
    async fn id(&self) -> ID { (&self.id).into() }

    // async fn name<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<String> {
    //     let ctx: &Arc<crate::Context> = ctx.data()?;

    //     if let Some(print) = self.print.as_ref() {
    //         let part = Part::get(&ctx.db, print.part_id)?;

    //         Ok(part.name.to_string())
    //     } else {
    //         Ok("[UNNAMED_TASK]".to_string())
    //     }
    // }

    async fn status(&self) -> TaskStatusGQL { (&self.status).into() }
    async fn paused(&self) -> bool { self.status == TaskStatus::Paused }

    // TODO: rename field to match model
    async fn total_line_numbers(&self) -> u64 { self.total_lines }
    // TODO: rename field to match model
    async fn current_line_number(&self) -> &Option<u64> { &self.despooled_line_number }

    async fn percent_complete(
        &self,

        #[graphql(desc = r#"
            The number of digits to the right of the decimal place to round to. eg.
            * percent_complete(digits: 0) gives 3
            * percent_complete(digits: 2) gives 3.14
        "#)]
        digits: Option<u8>,
    ) -> FieldResult<f32> {
        let printed_lines = self.despooled_line_number
            .map(|n| n + 1)
            .unwrap_or(0);

        let percent = 100.0 * (printed_lines as f32) / (self.total_lines as f32);

        if let Some(digits) = digits {
            let scale = 10f32.powi(digits as i32);
            Ok((percent * scale).round() / scale)
        } else {
            Ok(percent)
        }
    }

    // TODO: migrate print data to a seperate table/wrapping graphql object in the job queue crate?
    //
    // async fn estimated_print_time_millis(&self) -> Option<u64> {
    //     self.print
    //         .as_ref()
    //         .and_then(|p| p.estimated_print_time)
    //         .map(|durration| {
    //             durration.as_millis().try_into().unwrap_or(u64::MAX)
    //         })
    // }

    // async fn estimated_filament_meters(&self) -> Option<f64> {
    //     self.print.as_ref().and_then(|p| p.estimated_filament_meters)
    // }

    async fn created_at(&self) -> &DateTime<Utc> { &self.created_at }
    // TODO: rename field to match model
    async fn started_at(&self) -> &DateTime<Utc> { &self.created_at }

    async fn machine<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<MachineData> {
        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();
        let machine_id = (&self.machine_id).into();

        let addr = machines.get(&machine_id)
            .ok_or_else(|| anyhow!("Unable to get machine ({:?}) for task", machine_id))?;

        let machine_data = addr.call(GetData).await??;

        Ok(machine_data)
    }
}
