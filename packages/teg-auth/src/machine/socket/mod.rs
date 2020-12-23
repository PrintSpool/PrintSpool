// use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;
use futures::FutureExt;
use async_std::task::{self, spawn};

use std::sync::Arc;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use crate::machine::models::Machine;
use crate::models::versioned_model::VersionedModel;

mod send_message;
use send_message::send_message;

mod receive_message;
use receive_message::receive_message;

mod receive_loop;
use receive_loop::run_receive_loop;

mod send_loop;
use send_loop::run_send_loop;

pub async fn handle_machine_socket(ctx: Arc<crate::Context>, machine_id: crate::DbId) -> Result<()> {
    let machine = Machine::get(&ctx.db, machine_id)?;
    let socket_path = format!(
        "/var/lib/teg/machine-{}.sock",
        machine.config_id.to_string(),
    );

    let client_id: crate::DbId = 42; // Chosen at random. Very legit.

    loop {
        info!("Connecting to machine socket: {:?}", socket_path);
        let stream = match UnixStream::connect(&socket_path).await {
            Ok(stream) => stream,
            Err(err) => {
                use std::time::Duration;

                error!("Unable to open machine socket, retrying in 500ms: {:?}", err);
                task::sleep(Duration::from_millis(500)).await;
                continue
            }
        };
        
        info!("Connected to machine socket: {:?}", socket_path);

        let send_loop = run_send_loop(
            client_id,
            Arc::clone(&ctx),
            machine_id,
            stream.clone(),
        );

        let receive_loop = run_receive_loop(
            client_id,
            Arc::clone(&ctx),
            machine_id,
            stream.clone(),
        );

        let res = futures::select! {
            res = send_loop.fuse() => res,
            res = spawn(receive_loop).fuse() => res,
        };

        info!("Machine socket closed");
        let _ = res.map_err(|err| error!("Machine socket Error: {:?}", err));

        let _ = stream.shutdown(async_std::net::Shutdown::Both);
    }
}
