use teg_machine::machine::resolvers::mutation_resolvers::MachineMutation;

#[derive(async_graphql::MergedObject, Default)]
pub struct Mutation(
    MachineMutation,
    // EStopAndResetMutation,
    // PrintQueueMutation,
);
