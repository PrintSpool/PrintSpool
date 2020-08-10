use async_std::prelude::*;
use async_std::os::unix::net::UnixStream;

use std::sync::Arc;
use anyhow::{
    // anyhow,
    Result,
    Context as _,
};
use bytes::BufMut;

use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
    // MachineMessage,
    // machine_message,
    Message,
};

use crate::models::VersionedModel;
use crate::print_queue::tasks::{
    Task,
    TaskStatus,
    TaskContent,
};

pub async fn handle_machine_socket(ctx: Arc<crate::Context>) -> Result<()> {
    let machine_id = &ctx.machine_config.read().await.id;
    let socket_path = format!("/var/lib/teg/machine-{}.sock", machine_id.to_string());


    info!("Connecting to machine socket: {:?}", socket_path);
    let mut stream = UnixStream::connect(&socket_path).await?;
    info!("Connected to machine socket: {:?}", socket_path);

    let mut subscriber = Task::watch_all(&ctx.db);
    // let mut busy = Arc::new(false);
    let client_id = 42; // Chosen at random. Very legit.

    loop {
        use sled::Event;
        use std::convert::TryInto;

        let event = (&mut subscriber).await;

        // if busy {
        //     continue;
        // }
        info!("Task Changed: {:?}", event);

        match event {
            Some(Event::Insert{ value, .. }) => {
                let task: Task = value.try_into()?;

                if task.status == TaskStatus::Spooled && !task.sent_to_machine {
                    // *busy = true;

                    let content = match task.content {
                        TaskContent::FilePath(file_path) => {
                            combinator_message::spool_task::Content::FilePath(file_path)
                        }
                        TaskContent::GCodes(gcodes) => {
                            combinator_message::spool_task::Content::Inline(
                                combinator_message::InlineContent {
                                    commands: gcodes,
                                },
                            )
                        }
                    };

                    let message = CombinatorMessage {
                        payload: Some(
                            combinator_message::Payload::SpoolTask(
                                combinator_message::SpoolTask {
                                    task_id: task.id.parse::<u32>()?,
                                    client_id,
                                    machine_override: task.machine_override,
                                    content: Some(content),
                                }
                            )
                        ),
                    };

                    // let message = CombinatorMessage {
                    //     payload: None,
                    // };

                    const SIZE_DELIMETER_BYTES: usize = 4;
                    let mut buf = Vec::with_capacity(
                        message.encoded_len() + SIZE_DELIMETER_BYTES,
                    );
                    buf.put_u32_le(message.encoded_len() as u32);

                    message.encode(&mut buf)
                        .with_context(|| "combinator message encoding failed")?;

                    info!("Sending Protobuf (Len: {} {})", buf.len(), buf.len() as u32);
                    info!("Writing: {:?}", buf);

                    stream.write_all(&buf)
                        .await?;

                    info!("Sent Protobuf");

                }
            }
            _ => ()
        }
    }
}
