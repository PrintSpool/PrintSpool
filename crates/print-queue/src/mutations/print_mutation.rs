use anyhow::{
    // Result,
    anyhow,
    // Context as _,
};
use async_graphql::{
    ID,
    FieldResult,
};
use teg_machine::{MachineMap, task::Task};

use crate::insert_print;

#[derive(Default)]
pub struct PrintMutation;

#[derive(async_graphql::InputObject, Debug)]
struct PrintInput {
    #[graphql(name="machineID")]
    machine_id: ID,
    // TODO: update graphql names to match latest struct fields
    // #[field(name="partID")]
    #[graphql(name="jobFileID")]
    part_id: ID,
}


#[async_graphql::Object]
impl PrintMutation {
    /// Starts a task to print the part.
    async fn spool_job_file<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: PrintInput,
    ) -> FieldResult<Task> {
        let db: &crate::Db = ctx.data()?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();
        let machine = machines.get(&input.machine_id)
            .ok_or_else(||
                anyhow!("machine ({:?}) not found for spool job file", input.machine_id)
            )?;

        let task = insert_print(
            db,
            machine.clone(),
            input.machine_id.to_string(),
            input.part_id.to_string(),
            false,
        ).await?;

        Ok(task)
    }
}
