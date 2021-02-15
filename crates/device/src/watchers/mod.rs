mod block_on_serial_directory_create;
pub use block_on_serial_directory_create::block_on_serial_directory_create;

mod watch_device_directory;
pub use watch_device_directory::watch_device_directory;

use xactor::Actor;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

#[xactor::message(result = "()")]
struct WatchDevices;

pub struct DevSerialWatcher {
    pub device_manager: crate::DeviceManagerAddr,
}

impl DevSerialWatcher {
    pub async fn watch_dev_serial(&self) -> Result<()> {
        // Normally serial ports are created at /dev/serial/by-id/
        loop {
            // /dev/serial is only created when a serial port is connected to the computer
            block_on_serial_directory_create().await?;
            // Once /dev/serial exists watch for new device files in it
            watch_device_directory(
                "/dev/serial/by-id/",
            None,
            self.device_manager.clone(),
            ).await?
        }
    }
}

#[async_trait::async_trait]
impl Actor for DevSerialWatcher {
    #[instrument(skip(self, ctx))]
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()> {
        ctx.address().send(WatchDevices)?;

        Ok(())
    }
}

#[async_trait::async_trait]
impl xactor::Handler<WatchDevices> for DevSerialWatcher {
    #[instrument(skip(self, ctx, _msg))]
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, _msg: WatchDevices) -> () {
        let result = self.watch_dev_serial().await;

        if let Err(err) = result {
            warn!("Error watching /dev/serial/by-id/ device files: {:?}", err);
            ctx.stop(Some(err));
        };
   }
}

pub struct KlipperWatcher {
    pub device_manager: crate::DeviceManagerAddr,
}

#[async_trait::async_trait]
impl Actor for KlipperWatcher {
    #[instrument(skip(self, ctx))]
    async fn started(&mut self, ctx: &mut xactor::Context<Self>) -> Result<()> {
        ctx.address().send(WatchDevices)?;

        Ok(())
    }
}

#[async_trait::async_trait]
impl xactor::Handler<WatchDevices> for KlipperWatcher {
    #[instrument(skip(self, ctx, _msg))]
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, _msg: WatchDevices) -> () {
        // The Klipper serial port is created in /tmp/printer so it needs a seperate
        // watcher.
        // If you are configuring multiple klipper printer (is that's even possible?)
        // you MUST start each printer's path with /tmp/printer eg. /tmp/printer3
        let result = watch_device_directory(
            "/tmp/",
            Some("printer"),
            self.device_manager.clone(),
        ).await;

        if let Err(err) = result {
            warn!("Error watching klipper device files: {:?}", err);
            ctx.stop(Some(err));
        };
   }
}
