use std::{collections::HashMap};
use xactor::Actor;
use eyre::{
    // eyre,
    Result,
    // Context as _,
};

use crate::{
    Device,
    watchers::{DevSerialWatcher, KlipperWatcher},
};

#[derive(Default)]
pub struct DeviceManager {
    pub devices: HashMap<String, Device>,
}

pub type DeviceManagerAddr = xactor::Addr<DeviceManager>;

#[async_trait::async_trait]
impl Actor for DeviceManager {
}

impl DeviceManager {
    /// Starts the device manager xactor supervisor and the file watchers.
    ///
    /// Only call this function once at the start of the application. Multiple calls to start
    /// will result in duplicate file watchers.
    pub async fn start() -> Result<DeviceManagerAddr> {
        let device_manager = xactor::Supervisor::start(move ||
            DeviceManager {
                devices: HashMap::new(),
            }
        ).await?;

        // Watch /dev/serial/by-id/*
        let addr = device_manager.clone();
        xactor::Supervisor::start(move ||
            DevSerialWatcher {
                device_manager: addr.clone(),
            }
        ).await?;

        // Watch /tmp/printer*
        let addr = device_manager.clone();
        xactor::Supervisor::start(move ||
            KlipperWatcher {
                device_manager: addr.clone(),
            }
        ).await?;

        info!("Device Manager Started");

        Ok(device_manager)
    }
}
