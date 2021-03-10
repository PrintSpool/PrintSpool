use chrono::{prelude::*};
use async_graphql::{ FieldResult, ID, Context };
use eyre::{
    eyre,
    // Result,
    // Context as _,
};

use super::{Task, task_status::TaskStatusGQL};

use crate::{MachineMap, machine::{
    MachineData,
    messages::GetData,
}};

/// A spooled set of gcodes to be executed by the machine
#[async_graphql::Object]
impl Task {
    async fn id(&self) -> ID { (&self.id).into() }

    #[graphql(name="partID")]
    async fn part_id(&self) -> Option<ID> {
        self.part_id.as_ref().map(Into::into)
    }

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
    async fn paused(&self) -> bool { self.status.is_paused() }

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

    async fn estimated_print_time_millis(&self) -> Option<u64> {
        self.estimated_print_time.map(|duration| {
            let millis = duration.as_millis();
            // Saturating conversion to u64
            std::cmp::min(millis, std::u64::MAX as u128) as u64
        })
    }

    async fn estimated_filament_meters(&self) -> &Option<f64> {
        &self.estimated_filament_meters
    }

    async fn created_at(&self) -> &DateTime<Utc> { &self.created_at }
    // TODO: rename field to match model
    async fn started_at(&self) -> &DateTime<Utc> { &self.created_at }

    async fn stopped_at(&self) -> Option<&DateTime<Utc>> {
        use super::*;

        match &self.status {
            | TaskStatus::Finished(Finished { finished_at: t })
            | TaskStatus::Paused(Paused { paused_at: t })
            | TaskStatus::Cancelled(Cancelled { cancelled_at: t })
            | TaskStatus::Errored(Errored { errored_at: t, .. })
            => Some(t),
            _ => None,
        }
    }

    async fn machine<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<MachineData> {
        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();
        let machine_id = (&self.machine_id).into();

        let addr = machines.get(&machine_id)
            .ok_or_else(|| eyre!("Unable to get machine ({:?}) for task", machine_id))?;

        let machine_data = addr.call(GetData).await??;

        Ok(machine_data)
    }
}
