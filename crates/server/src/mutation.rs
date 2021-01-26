use teg_auth::{
    InviteMutation,
    UserMutation,
};

use teg_machine::{
    ConfigMutation,
    MachineMutation,
};

use teg_material::MaterialMutation;
use teg_print_queue::PrintQueueMutation;

#[derive(async_graphql::MergedObject, Default)]
pub struct Mutation(
    // auth
    InviteMutation,
    UserMutation,
    // machine
    ConfigMutation,
    MachineMutation,
    // material
    MaterialMutation,
    // print queue
    PrintQueueMutation,
);
