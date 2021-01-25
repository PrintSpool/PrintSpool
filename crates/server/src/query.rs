use teg_machine::machine::resolvers::query_resolvers::MachineQuery;
use teg_print_queue::PrintQueueQuery;

#[derive(async_graphql::MergedObject, Default)]
pub struct Query(
    MachineQuery,
    PrintQueueQuery,
);
