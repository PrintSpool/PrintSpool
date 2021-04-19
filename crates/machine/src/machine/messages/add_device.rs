// use eyre::{
//     eyre,
//     Result,
//     // Context as _,
// };

use crate::{machine::{Machine, MachineStatus}};

use super::ResetWhenIdle;

#[xactor::message(result = "()")]
#[derive(Clone, Debug)]
pub struct AddDevice(pub String);

#[async_trait::async_trait]
impl xactor::Handler<AddDevice> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: AddDevice) -> () {
        // Check that the device path matches the machines' serial port path
        let data = if let Some(data) = &self.data {
            data
        } else {
            return ()
        };
        dbg!(&msg, data.config.tty_path(), self.unix_socket.is_some(), &data.status);

        if &msg.0 != data.config.tty_path() {
            return ()
        }

        // Check if we are connected to the socket and disconnected from the serial port to avoid
        // race conditions between the Machine actor startup and the DeviceManager's initialization
        // which sends add events for each file path.
        if self.unix_socket.is_some() && data.status == MachineStatus::Disconnected {
            if let Err(err) = ctx.address().send(ResetWhenIdle) {
                warn!("Error restarting machine after device reconnection: {:?}", err);
            }
        }
    }
}
