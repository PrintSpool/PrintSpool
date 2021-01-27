use teg_auth::{
    InviteQuery,
    UserQuery,
};

use teg_device::DeviceQuery;

use teg_material::MaterialQuery;

use teg_machine::{
    ConfigQuery,
    MachineQuery,
};

use teg_print_queue::PrintQueueQuery;

use crate::server_query::ServerQuery;

#[derive(async_graphql::MergedObject, Default)]
pub struct Query(
    // auth
    InviteQuery,
    UserQuery,
    // device
    DeviceQuery,
    // machine
    ConfigQuery,
    MachineQuery,
    // material
    MaterialQuery,
    // print queue
    PrintQueueQuery,
    // server
    ServerQuery,
);
