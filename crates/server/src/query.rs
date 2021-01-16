use teg_machine::machine::resolvers::query_resolvers::MachineQuery;

#[derive(async_graphql::MergedObject, Default)]
pub struct Query(
    // PrintQueueQuery,
    MachineQuery,
);
