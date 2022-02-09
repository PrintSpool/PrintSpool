use printspool_auth::{
    InviteMutation,
    UserMutation,
};

use printspool_machine::{
    ComponentMutation,
    ConfigMutation,
    MachineMutation,
    VideoMutation,
};

use printspool_material::MaterialMutation;
use printspool_print_queue::PrintQueueMutation;

#[derive(async_graphql::MergedObject, Default)]
pub struct Mutation(
    // auth
    InviteMutation,
    UserMutation,
    // machine
    ComponentMutation,
    ConfigMutation,
    MachineMutation,
    VideoMutation,
    // material
    MaterialMutation,
    // print queue
    PrintQueueMutation,
);
