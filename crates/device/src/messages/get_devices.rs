use std::collections::HashMap;

use crate::{
    Device,
    device_manager::DeviceManager,
};

#[xactor::message(result = "HashMap<String, Device>")]
pub struct GetDevices;

#[async_trait::async_trait]
impl xactor::Handler<GetDevices> for DeviceManager {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, _msg: GetDevices) -> HashMap<String, Device> {
        self.devices.clone()
    }
}
