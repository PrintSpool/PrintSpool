use teg_auth::InviteMutation;
use teg_machine::{
    ConfigMutation,
    MachineMutation,
};
use teg_print_queue::PrintQueueMutation;

#[derive(async_graphql::MergedObject, Default)]
pub struct Mutation(
    InviteMutation,
    ConfigMutation,
    MachineMutation,
    PrintQueueMutation,
);
