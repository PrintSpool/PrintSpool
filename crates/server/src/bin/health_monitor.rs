#[macro_use] extern crate tracing;
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use tracing_subscriber::prelude::*;
use std::{thread::sleep, time::Duration};
use std::os::unix::net::UnixStream;
use std::io::prelude::*;
use std::os::unix::fs::PermissionsExt;
use pidfile_rs::{
    Pidfile,
    PidfileError,
};

/// Connects to the server's health check socket periodically and restarts the server if it does
/// not receive an "ack\n" health check confirmation.
fn main() -> Result<()> {
    dotenv::dotenv().ok();
    tracing_subscriber::Registry::default()
        // any number of other subscriber layers may be added before or
        // after the `ErrorLayer`...
        .with(tracing_error::ErrorLayer::default())
        .init();
    // tracing_subscriber::fmt::init();
    color_eyre::install()?;

    if std::env::var("DISABLE_TEG_HEALTH_MONITOR").map(|v| v == "1") == Ok(true) {
        info!("Server health monitor disabled");
        return Ok(())
    }

    info!("Server health monitor started");
    sleep(Duration::from_secs(1));

    let socket_path = teg_server::paths::var().join("health-check.sock");

    loop {
        let mut unix_socket = match UnixStream::connect(&socket_path) {
            Ok(stream) => stream,
            Err(err) => {
                warn!("Unable to open socket to server for health checks. Err: {:?}", err);
                kill_server()?;

                continue;
            }
        };

        unix_socket.set_read_timeout(Some(Duration::from_secs(10)))?;

        // unix_socket.write_all(b"health_check\n")?;
        let mut response = String::new();
        if let Err(err) = unix_socket.read_to_string(&mut response) {
            warn!("Server health check error: {:?}", err);
            kill_server()?;
            continue;
        }

        if response != "ack\n" {
            warn!("Unexpected server health check response: {:?}", response);
            kill_server()?;
            continue;
        }

        sleep(Duration::from_millis(500))
    }
}

fn kill_server() -> Result<()> {
    warn!("Killing the server");

    // Attempt to lock the pidfile
    let pid_file = "/var/tmp/teg-server.pid";

    let lock_result = Pidfile::new(
        &pid_file.into(),
        std::fs::Permissions::from_mode(0o600),
    )
        // Drop the pidfile lock immediately to prevent blocking the server from starting
        .map(|_| ());

    match lock_result {
        Err(PidfileError::AlreadyRunning { pid: Some(pid) }) => {
            // The server process is running (as expected) so lets kill it.
            let pid = nix::unistd::Pid::from_raw(pid);

            if let Err(err) = nix::sys::signal::kill(pid, nix::sys::signal::Signal::SIGKILL) {
                return Err(eyre!("Error sending kill signal to server: {:?}", err));
            };
        }
        Err(err) => {
            return Err(eyre!("Error opening server pidfile: {:?}", err));
        }
        Ok(_) => {
            // The server process is not running. This is not expected behavior.
            return Err(eyre!("No running server PID found"));
        }
    };

    sleep(Duration::from_secs(1));

    Ok(())
}
