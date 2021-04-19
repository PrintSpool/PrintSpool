use std::{ffi::OsString, path::{Path}};

use async_std::fs;
use inotify::{EventMask, Inotify, WatchMask};
use futures::stream::StreamExt;
use eyre::{
    // eyre,
    Result,
    Context as _,
};
use xactor::Service;
use teg_machine::machine::messages::AddDevice;

use crate::{
    messages::{
        remove_device::RemoveDevice,
        remove_device_directory::RemoveDeviceDirectory,
    },
};

pub fn device_path(
    path: &'static str,
    pattern: Option<&'static str>,
    file_name: &Option<OsString>,
) -> Result<Option<String>> {
    let file_name = file_name
        .as_ref()
        .and_then(|file_name| file_name.clone().into_string().ok());

    let file_name = if let Some(file_name) = file_name {
        file_name
    } else {
        return Ok(None)
    };

    let is_serial_port = pattern
        .map(|pattern| file_name.starts_with(pattern))
        .unwrap_or(true);

    if is_serial_port {
        Ok(Path::new(path).join(file_name).to_str().map(|s| s.to_string()))
    } else {
        Ok(None)
    }
}

pub async fn watch_device_directory(
    path: &'static str,
    pattern: Option<&'static str>,
    addr: crate::DeviceManagerAddr,
) -> Result<()> {
    let mut broker = xactor::Broker::from_registry().await?;

    let mut inotify = Inotify::init()
        .expect("Error while initializing inotify instance");

    let watch_mask =
        WatchMask::CREATE |
        WatchMask::MOVED_TO |
        WatchMask::DELETE |
        WatchMask::DELETE_SELF |
        WatchMask::MOVED_FROM;

    inotify
        .add_watch(
            path,
            watch_mask
        )
        .wrap_err("Failed to add file watch")?;

    info!("Watching devices directory: {}", path);

    let buffer = [0; 32];
    let mut event_stream = inotify.event_stream(buffer)?;

    // Add the devices already in the directory
    let mut files = fs::read_dir(path).await?;

    while let Some(file) = files.next().await.transpose()? {
        if !file.file_type().await?.is_dir() {
            let file_name = Some(file.file_name());
            if let Some(path) = device_path(path, pattern, &file_name)? {
                broker.publish(AddDevice(path))?;
            }
        }
    }

    // stream new devices as they are created and destroyed
    while let Some(Ok(event)) = event_stream.next().await {
        let mask = &event.mask;
        let file_name = &event.name;
        if mask.intersects(EventMask::DELETE_SELF) {
            break
        }
        if mask.intersects(EventMask::CREATE | EventMask::MOVED_TO) {
            // Create a device
            // dbg!(&event);

            if let Some(path) = device_path(path, pattern, file_name)? {
                broker.publish(AddDevice(path))?;
            };
        }
        if mask.intersects(EventMask::DELETE | EventMask::MOVED_FROM) {
            // Delete a device
            // dbg!(&event);

            if let Some(path) = device_path(path, pattern, file_name)? {
                addr.send(RemoveDevice(path))?;
            };
        }
    }

    // Delete all devices in this directory and then return
    addr.send(RemoveDeviceDirectory(path.to_string()))?;

    Ok(())
}

