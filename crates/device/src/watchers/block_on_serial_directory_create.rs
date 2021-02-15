use inotify::{Inotify, WatchMask};
use futures::stream::StreamExt;
use eyre::{
    eyre,
    Result,
    // Context as _,
};

pub async fn block_on_serial_directory_create() -> Result<()> {
    let mut inotify = Inotify::init()
        .expect("Error while initializing inotify instance");

    // Watch for modify and close events.
    inotify
        .add_watch(
            "/dev",
            // WatchMask::MODIFY | WatchMask::CLOSE | WatchMask::MOVED_TO,
            WatchMask::CREATE,
        )
        .expect("Failed to add file watch");

    // Check if the serial directory already exists
    if std::path::Path::new("/dev/serial/").exists() {
        return Ok(())
    }

    info!("Waiting on /dev/serial/ create");

    let buffer = [0; 32];
    let mut event_stream = inotify.event_stream(buffer)?;

    while let Some(event) = event_stream.next().await.transpose()? {
        if event.name.map(|name| name == "serial").unwrap_or(false) {
            // Handle event
            // dbg!(event);
            return Ok(())
        }
    }

    return Err(eyre!("Event stream ended without serial directory create"))
}
