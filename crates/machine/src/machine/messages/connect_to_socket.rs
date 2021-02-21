use async_codec::Framed;
use async_std::os::unix::net::UnixStream;
use std::time::Duration;
// use eyre::{
//     // eyre,
//     Result,
//     // Context as _,
// };

use crate::{
    machine::{
        Machine,
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
            if let Err(err) = self.reset_data().await {
                error!("Unable to load machine config, retrying in 500ms: {:?}", err);
                self.attempting_to_connect = false;

                ctx.send_later(ConnectToSocket, Duration::from_millis(500));
                return
            }
        }

        let socket_path = format!(
            "/var/lib/teg/machine-{}.sock",
            self.id,
        );

        // let client_id: crate::DbId = 42; // Chosen at random. Very legit.

        let unix_socket = match UnixStream::connect(&socket_path).await {
            Ok(stream) => stream,
            Err(err) => {
                debug!("Unable to open machine socket, retrying in 500ms");
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

        ctx.add_stream(socket_stream());
        self.write_stream = Some(socket_stream());

        self.unix_socket = Some(unix_socket);

        info!("Connected to machine socket: {:?}", socket_path);
    }
}
