use crate::{
    device_manager::DeviceManager,
};

#[xactor::message(result = "()")]
pub struct RemoveDevice(pub String);

#[async_trait::async_trait]
impl xactor::Handler<RemoveDevice> for DeviceManager {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, msg: RemoveDevice) -> () {
        self.devices.remove(&msg.0);
    }
}
