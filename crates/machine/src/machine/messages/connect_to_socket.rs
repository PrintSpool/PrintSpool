use async_codec::Framed;
use async_std::os::unix::net::UnixStream;
use std::time::Duration;
use async_std::fs;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use crate::{
    config::MachineConfig,
    machine::{Machine,
        MachineData,
        streams::receive_stream::codec::MachineCodec
    },
};

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
            let config_path = format!("/etc/teg/machine-{}.toml", self.id);

            let machine_data = (|| async move {
                let config = fs::read_to_string(config_path).await?;
                let config: MachineConfig = toml::from_str(&config)?;

                Result::<_>::Ok(MachineData::new(config))
            })().await;

            if let Err(err) = machine_data {
                error!("Unable to load machine config, retrying in 500ms: {:?}", err);

                ctx.send_later(ConnectToSocket, Duration::from_millis(500));
                return
            }

            self.data = machine_data.ok();
        }

        let socket_path = format!(
            "/var/lib/teg/machine-{}.sock",
            self.id,
        );

        // let client_id: crate::DbId = 42; // Chosen at random. Very legit.

        info!("Connecting to machine socket: {:?}", socket_path);
        let unix_socket = match UnixStream::connect(&socket_path).await {
            Ok(stream) => stream,
            Err(err) => {
                error!("Unable to open machine socket, retrying in 500ms: {:?}", err);

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

        ctx.add_stream(socket_stream());
        self.write_stream = Some(socket_stream());

        self.unix_socket = Some(unix_socket);

        info!("Connected to machine socket: {:?}", socket_path);
    }
}
