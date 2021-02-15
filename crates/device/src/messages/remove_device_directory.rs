use crate::{
    device_manager::DeviceManager,
};

#[xactor::message(result = "()")]
pub struct RemoveDeviceDirectory(pub String);

#[async_trait::async_trait]
impl xactor::Handler<RemoveDeviceDirectory> for DeviceManager {
    async fn handle(&mut self, _ctx: &mut xactor::Context<Self>, msg: RemoveDeviceDirectory) -> () {
        self.devices.retain(|device_id, _| {
            !(device_id).starts_with(&msg.0)
        });
    }
}
