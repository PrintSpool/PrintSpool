use async_codec::Framed;
use async_std::os::unix::net::UnixStream;
use std::time::Duration;

use crate::machine::{Machine, streams::receive_stream::codec::MachineCodec};

#[xactor::message(result = "()")]
pub struct ConnectToSocket;

#[async_trait::async_trait]
impl xactor::Handler<ConnectToSocket> for Machine {
    async fn handle(&mut self, ctx: &mut xactor::Context<Self>, msg: ConnectToSocket) -> () {
        if self.data.attempting_to_connect {
            return
        };
        self.data.attempting_to_connect = true;

        let socket_path = format!(
            "/var/lib/teg/machine-{}.sock",
            self.data.config.id,
        );

        let client_id: crate::DbId = 42; // Chosen at random. Very legit.

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
