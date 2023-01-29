use async_graphql::{Context, FieldResult, ID};
use chrono::prelude::*;
use eyre::eyre;

use super::{task_status::TaskStatusGQL, Task, TaskStatus};

use crate::{
    driver_instance::{messages::GetData, MachineData},
    MachineMap,
};

/// A spooled set of gcodes to be executed by the machine
#[async_graphql::Object]
impl Task {
    async fn id(&self) -> ID {
        (&self.id).into()
    }

    #[graphql(name = "partID")]
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

    #[graphql(name = "status")]
    async fn _status(&self) -> TaskStatusGQL {
        (&self.status).into()
    }

    #[graphql(name = "paused")]
    async fn _paused(&self) -> bool {
        self.status.is_paused()
    }

    #[graphql(name = "settled")]
    async fn _settled(&self) -> bool {
        self.status.is_settled()
    }

    async fn total_lines(&self) -> u64 {
        self.total_lines
    }

    async fn despooled_line_number(&self) -> &Option<u64> {
        &self.despooled_line_number
    }

    async fn percent_complete(
        &self,

        #[graphql(desc = r#"
            The number of digits to the right of the decimal place to round to. eg.
            * percent_complete(digits: 0) gives 3
            * percent_complete(digits: 2) gives 3.14
        "#)]
        digits: Option<u8>,
    ) -> FieldResult<f32> {
        let printed_lines = self.despooled_line_number.map(|n| n + 1).unwrap_or(0) as f32;

        let percent = if self.status.was_successful() {
            // Empty tasks need to denote success somehow
            100.0
        } else {
            // Empty tasks need to not divide by zero
            let total_lines = std::cmp::max(self.total_lines, 1) as f32;

            100.0 * printed_lines / total_lines
        };

        if let Some(digits) = digits {
            let scale = 10f32.powi(digits as i32);
            Ok((percent * scale).round() / scale)
        } else {
            Ok(percent)
        }
    }

    async fn estimated_print_time_millis(&self) -> Option<u64> {
        self.estimated_print_time.map(|print_time| {
            let millis = print_time.as_millis();
            // Saturating conversion to u64
            std::cmp::min(millis, std::u64::MAX as u128) as u64
        })
    }

    async fn eta<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<Option<DateTime<Utc>>> {
        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();
        let machine_id = (&self.machine_id).into();

        let addr = machines
            .get(&machine_id)
            .ok_or_else(|| eyre!("Unable to get machine ({:?}) for task", machine_id))?;

        let machine_data = addr.call(GetData).await??;

        let print_time = if let Some(print_time) = self.estimated_print_time {
            print_time
        } else {
            return Ok(None);
        };

        let mut duration = print_time + self.time_paused + self.time_blocked;

        if let TaskStatus::Paused(paused_status) = &self.status {
            duration += (Utc::now() - paused_status.paused_at).to_std()?;
        } else if let Some(blocked_at) = machine_data.blocked_at {
            if self.status.is_pending() {
                duration += (Utc::now() - blocked_at).to_std()?;
            }
        }

        let eta = self.created_at + ::chrono::Duration::from_std(duration)?;
        Ok(Some(eta))
    }

    async fn estimated_filament_meters(&self) -> &Option<f64> {
        &self.estimated_filament_meters
    }

    async fn started_at(&self) -> &DateTime<Utc> {
        &self.created_at
    }

    async fn stopped_at(&self) -> Option<&DateTime<Utc>> {
        use super::*;

        match &self.status {
            TaskStatus::Finished(Finished { finished_at: t })
            | TaskStatus::Paused(Paused { paused_at: t })
            | TaskStatus::Cancelled(Cancelled { cancelled_at: t })
            | TaskStatus::Errored(Errored { errored_at: t, .. }) => Some(t),
            _ => None,
        }
    }

    async fn machine<'ctx>(&self, ctx: &'ctx Context<'_>) -> FieldResult<MachineData> {
        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();
        let machine_id = (&self.machine_id).into();

        let addr = machines
            .get(&machine_id)
            .ok_or_else(|| eyre!("Unable to get machine ({:?}) for task", machine_id))?;

        let machine_data = addr.call(GetData).await??;

        Ok(machine_data)
    }
}
