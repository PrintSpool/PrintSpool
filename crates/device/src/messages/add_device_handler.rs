// use eyre::{
//     eyre,
//     Result,
//     // Context as _,
// };

use crate::{
    Device,
    device_manager::DeviceManager,
};

use printspool_machine::machine::messages::AddDevice;

#[async_trait::async_trait]
impl xactor::Handler<AddDevice> for DeviceManager {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, msg: AddDevice) -> () {
        let device = Device {
            id: msg.0,
            connected: true,
        };
        self.devices.insert(device.id.clone(), device);
    }
}
