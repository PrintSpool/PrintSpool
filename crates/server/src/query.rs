use printspool_auth::{
    InviteQuery,
    UserQuery,
};

use printspool_device::DeviceQuery;

use printspool_material::MaterialQuery;

use printspool_machine::{
    ConfigQuery,
    MachineQuery,
    VideoQuery,
};

use printspool_print_queue::{
    PartQuery,
    PrintQueueQuery,
    SlicersQuery,
};

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
    VideoQuery,
    // material
    MaterialQuery,
    // print queue
    PartQuery,
    PrintQueueQuery,
    SlicersQuery,
    // server
    ServerQuery,
);
