// use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;

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
    super::spool_task,
    send_message,
};

pub async fn run_send_loop(
    client_id: u32,
    ctx: Arc<crate::Context>,
    _machine_id: u64,
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
                let task: Task = value.try_into()?;

                if 
                    task.status == TaskStatus::Spooled
                    && !task.sent_to_machine
                {
                    send_message(&mut stream, spool_task(client_id, &task)?)
                        .await?;

                    Task::fetch_and_update(
                        &ctx.db,
                        task.id,
                        |task| task.map(|mut task| {
                            task.sent_to_machine = true;
                            task
                        }),
                    )?;
                }
            }
            _ => ()
        }
    }
}

