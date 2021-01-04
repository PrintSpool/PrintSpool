use std::{collections::HashMap, path::PathBuf};

use xactor::Actor;
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use notify::{Watcher, RecommendedWatcher, RecursiveMode};

use crate::{Device, messages::{add_device::AddDevice, remove_device::RemoveDevice}};

pub struct DeviceManager {
    pub devices: HashMap<String, Device>,
}

pub type DeviceManagerAddr = xactor::Addr<DeviceManager>;

#[async_trait::async_trait]
impl Actor for DeviceManager {
}

pub fn device_path(path_buf: PathBuf) -> Result<Option<String>> {
    let path = path_buf.into_os_string().into_string()
        .map_err(|_| anyhow!("Unable to convert file path to string"))?;

    let is_serial_port = path.starts_with("/dev/serial/by-id/");
    let is_klipper_printer = path.starts_with("/tmp/printer");

    if is_serial_port || is_klipper_printer {
        Ok(Some(path))
    } else {
        Ok(None)
    }
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

        let addr = device_manager.clone();
        let mut watcher: RecommendedWatcher = Watcher::new_immediate(move |res| {
            use notify::EventKind::{ Modify, Create, Remove };
            use notify::event::CreateKind;
            use notify::event::RemoveKind;
            use notify::event::ModifyKind::Name;
            use notify::event::RenameMode;

            let addr = addr.clone();
            match res {
                | Ok(notify::Event { kind: Create(CreateKind::File), paths, .. })
                | Ok(notify::Event { kind: Modify(Name(RenameMode::To)), paths, .. })
                => {
                    let result: Result<Vec<_>> = paths
                        .into_iter()
                        .map(|path_buf| {
                            if let Some(path) = device_path(path_buf)? {
                                addr.send(AddDevice(path))?;
                            };

                            Ok(())
                        })
                        .collect();

                    if let Err(err) = result {
                        warn!("Error adding device to device manager: {}", err);
                    }
                }
                | Ok(notify::Event { kind: Remove(RemoveKind::File), paths, .. })
                | Ok(notify::Event { kind: Modify(Name(RenameMode::From)), paths, .. })
                => {
                    let result: Result<Vec<_>> = paths
                        .into_iter()
                        .map(|path_buf| {
                            if let Some(path) = device_path(path_buf)? {
                                addr.send(RemoveDevice(path))?;
                            };

                            Ok(())
                        })
                        .collect();

                    if let Err(err) = result {
                        warn!("Error adding device to device manager: {}", err);
                    }
            }
            _ => (),
            }
        })?;

        // Normally serial ports are created at /dev/serial/by-id/
        watcher.watch("dev", RecursiveMode::Recursive)?;

        // The Klipper serial port is created in /tmp/printer so it needs a seperate
        // watcher.
        // If you are configuring multiple klipper printer (is that's even possible?)
        // you MUST start each printer's path with /tmp/printer eg. /tmp/printer3
        watcher.watch("tmp", RecursiveMode::NonRecursive)?;

        Ok(device_manager)
    }
}
