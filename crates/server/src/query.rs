use teg_machine::{
    ConfigQuery,
    MachineQuery,
};
use teg_print_queue::PrintQueueQuery;

#[derive(async_graphql::MergedObject, Default)]
pub struct Query(
    ConfigQuery,
    MachineQuery,
    PrintQueueQuery,
);
