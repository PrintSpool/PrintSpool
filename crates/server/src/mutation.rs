use teg_machine::machine::resolvers::mutation_resolvers::MachineMutation;
use teg_print_queue::mutations::PrintQueueMutation;

#[derive(async_graphql::MergedObject, Default)]
pub struct Mutation(
    MachineMutation,
    // EStopAndResetMutation,
    PrintQueueMutation,
);
