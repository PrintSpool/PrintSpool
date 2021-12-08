use std::env;
use std::time::Duration;
use async_codec::Framed;
use async_std::{
    // fs,
    os::unix::net::UnixStream,
    // path::Path,
    process::Command,
};
use eyre::{
    eyre,
    Result,
    // Context as _,
};

use crate::{
    config::MachineConfig,
    machine::{
        Machine,
        streams::receive_stream::codec::MachineCodec
    },
};

async fn spawn_driver(machine: &Machine) -> Result<()> {
    // let machine_config = &machine.get_data()?.config;
    // let pid_file = MachineConfig::pid_file_path();
    let config_file = MachineConfig::config_file_path(&machine.id);

    // let driver_is_running = if Path::new(&pid_file).exists().await {
    //     let pid = fs::read(pid_file)
    //         .await
    //         .map(String::from_utf8)??
    //         .parse::<u64>()?;

    //     let proc = format!("/proc/{}", pid);
    //     Path::new(&proc).exists().await
    // } else {
    //     false
    // };

    // if driver_is_running {
    //     return Ok(())
    // }

    let is_dev = env::var("RUST_ENV")
        .map(|v| &v == "development")
        .unwrap_or(true);

    let cmd = if is_dev {
        let mut marlin = env::current_exe()?;
        marlin.pop();
        marlin.pop();
        marlin.pop();
        marlin.push("crates/marlin");

        let marlin = marlin.to_str()
            .ok_or_else(|| eyre!("Error loading file path to drivers"))?;

        let release_flag = if
            env::var("RUN_MARLIN_IN_RELEASE")
                .map(|v| &v == "1")
                .unwrap_or(false)
        {
            " --release"
        } else {
            ""
        };

        // format!("cd {} && cargo watch -s \"cargo run -- {}\"", marlin, config_file)
        format!("RUST_BACKTRACE=1 cd {} && cargo run{} -- {}", marlin, release_flag, machine.id)
    } else {
        let marlin = crate::paths::etc().join("teg-marlin");
        let marlin = marlin.to_str()
            .ok_or_else(|| eyre!("Error loading file path to drivers"))?;

        format!("{} {}", marlin, machine.id)
    };

    info!("Spawning driver for {:?}: {}", config_file, cmd);
    Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .status()
        .await?;
        // .spawn()?;

    // Wait 50 milliseconds for the socket to open
    async_std::task::sleep(Duration::from_millis(50)).await;

    Ok(())
}

#[xactor::message(result = "()")]
pub struct ConnectToSocket;

#[async_trait::async_trait]
impl xactor::Handler<ConnectToSocket> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, _msg: ConnectToSocket) -> () {
        if self.attempting_to_connect {
            return
        };
        self.attempting_to_connect = true;

        // Load the config file
        if self.data.is_none() {
            if let Err(err) = self.reset_data().await {
                error!("Unable to load machine config, retrying in 500ms: {:?}", err);
                self.attempting_to_connect = false;

                ctx.send_later(ConnectToSocket, Duration::from_millis(500));
                return
            }
        }

        let socket_path = self.data.as_ref().unwrap().config.socket_path();

        // Start the driver if one is not already running
        if let Err(err) = spawn_driver(&self).await {
            error!("Unable to spawn driver, retrying in 500ms: {:?}", err);
            self.attempting_to_connect = false;

            ctx.send_later(ConnectToSocket, Duration::from_millis(500));
            return
        }

        // let client_id: crate::DbId = 42; // Chosen at random. Very legit.

        let unix_socket = match UnixStream::connect(&socket_path).await {
            Ok(stream) => stream,
            Err(err) => {
                debug!("Unable to open machine socket, retrying in 500ms ({:?})", socket_path);
                trace!("Machine socket err: {:?}", err);
                self.attempting_to_connect = false;

                ctx.send_later(ConnectToSocket, Duration::from_millis(500));
                return
            }
        };

        let socket_stream = || {
            Framed::new(
                unix_socket.clone(),
                MachineCodec,
            )
        };

        self.write_stream = Some(socket_stream());
        self.unix_socket = Some(unix_socket.clone());

        ctx.add_stream(socket_stream());

        info!("Connected to machine socket: {:?}", socket_path);
    }
}
