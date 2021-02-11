use teg_auth::{
    InviteQuery,
    UserQuery,
};

use teg_device::DeviceQuery;

use teg_material::MaterialQuery;

use teg_machine::{
    ConfigQuery,
    MachineQuery,
    VideoQuery,
};

use teg_print_queue::{
    PartQuery,
    PrintQueueQuery,
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
    // server
    ServerQuery,
);
