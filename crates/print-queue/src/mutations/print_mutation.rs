use eyre::{
    Result,
    eyre,
    // Context as _,
};
use async_graphql::{
    ID,
    FieldResult,
};
use teg_machine::MachineMap;
use crate::resolvers::print_resolvers::Print;

use crate::insert_print;

#[derive(Default)]
pub struct PrintMutation;

#[derive(async_graphql::InputObject, Debug)]
struct PrintInput {
    #[graphql(name="machineID")]
    machine_id: ID,
    // TODO: update graphql names to match latest struct fields
    // #[field(name="partID")]
    #[graphql(name="partID")]
    part_id: ID,
}


#[async_graphql::Object]
impl PrintMutation {
    /// Starts a task to print the part.
    async fn print<'ctx>(
        &self,
        ctx: &'ctx async_graphql::Context<'_>,
        input: PrintInput,
    ) -> FieldResult<Print> {
        let db: &crate::Db = ctx.data()?;

        let machines: &MachineMap = ctx.data()?;
        let machines = machines.load();

        async move {
            let machine = machines.get(&input.machine_id)
                .ok_or_else(||
                    eyre!("machine ({:?}) not found for spool job file", input.machine_id)
                )?;

            let print = insert_print(
                db,
                machine.clone(),
                input.machine_id.to_string(),
                input.part_id.to_string(),
                false,
            ).await?;

            Result::<_>::Ok(print)
        }
        // log the backtrace which is otherwise lost by FieldResult
        .await
        .map_err(|err| {
            warn!("{:?}", err);
            err.into()
        })
    }
}
