use teg_auth::{
    InviteQuery,
    UserQuery,
};

use teg_material::MaterialQuery;

use teg_machine::{
    ConfigQuery,
    MachineQuery,
};
use teg_print_queue::PrintQueueQuery;

#[derive(async_graphql::MergedObject, Default)]
pub struct Query(
    // auth
    InviteQuery,
    UserQuery,
    // machine
    ConfigQuery,
    MachineQuery,
    // material
    MaterialQuery,
    // print queue
    PrintQueueQuery,
);
