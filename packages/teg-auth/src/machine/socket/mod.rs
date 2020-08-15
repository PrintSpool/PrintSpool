// use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;
use async_graphql::ID;

use std::sync::Arc;
use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};
// use bytes::BufMut;

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
    TaskStatus,
    // TaskContent,
};
// use crate::machine::models::{
//     Machine,
//     // MachineStatus,
//     // Printing,
// };

use super::{
    spool_task,
};

mod send_message;
use send_message::send_message;

mod receive_message;
use receive_message::receive_message;

mod receive_loop;
use receive_loop::run_receive_loop;

pub async fn handle_machine_socket(ctx: Arc<crate::Context>, machine_id: ID) -> Result<()> {
    let socket_path = format!("/var/lib/teg/machine-{}.sock", machine_id.to_string());

    let client_id: u32 = 42; // Chosen at random. Very legit.

    info!("Connecting to machine socket: {:?}", socket_path);
    let stream = UnixStream::connect(&socket_path).await?;
    info!("Connected to machine socket: {:?}", socket_path);

    let send_loop = run_send_loop(
        client_id,
        Arc::clone(&ctx),
        machine_id.clone(),
        stream.clone(),
    );

    let receive_loop = run_receive_loop(
        client_id,
        Arc::clone(&ctx),
        machine_id.clone(),
        stream.clone(),
    );

    let futures_err = futures::future::try_join(
        send_loop,
        receive_loop,
    ).await;

    let _ = stream.shutdown(async_std::net::Shutdown::Both);

    futures_err?;

    Ok(())
}

pub async fn run_send_loop(
    client_id: u32,
    ctx: Arc<crate::Context>,
    _machine_id: ID,
    mut stream: UnixStream,
) -> Result<()> {
    let mut subscriber = Task::watch_all(&ctx.db);

    loop {
        use sled::Event;
        use std::convert::TryInto;

        let event = (&mut subscriber).await;

        info!("Task Changed: {:?}", event);

        match event {
            Some(Event::Insert{ value, .. }) => {
                let mut task: Task = value.try_into()?;

                if 
                    task.status == TaskStatus::Spooled
                    && !task.sent_to_machine
                {
                    send_message(&mut stream, spool_task(client_id, &task)?)
                        .await?;

                    task.sent_to_machine = true;

                    let _ = task.insert(&ctx.db)?;
                }
            }
            _ => ()
        }
    }
}

