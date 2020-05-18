extern crate teg_marlin;

// extern crate bytes;
// // #[macro_use]
// extern crate futures_core;
// extern crate futures_util;
// extern crate tokio;
// extern crate tokio_serial;

use std::{
    env,
    // fs,
};

use futures::{
    future,
//     FutureExt,
    stream::StreamExt,
//     SinkExt,
//     TryStreamExt,
};

use tokio::net::*;
use tokio::io::{
    // AsyncReadExt,
    AsyncWriteExt,
};
// use tokio::codec::{
//     length_delimited,
//     Framed,
// };

// use bytes::BufMut;

// use tokio::{
//     sync::mpsc,
// };

use tempfile::NamedTempFile;
use std::io::{Write};

use tokio_util::codec::{
    length_delimited,
    // Framed,
};

use bytes::Bytes;

use prost::Message;
use teg_marlin::{
    protos::{
        MachineMessage,
        machine_message,
        CombinatorMessage,
        combinator_message,
    },
    // state_machine::Event,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    teg_marlin::start(None)
        .await
        .expect("Unexpected teg-marlin error");

    eprintln!("SENDING SPOOL_TASK");
    let mut sock_path = env::current_exe()?;
    sock_path.pop();
    sock_path.push("machine.sock");
    let sock_path = sock_path.as_os_str();

    // 1!!!!

    let connect = UnixStream::connect(&sock_path);
    let client = connect.await.unwrap();

    let (reader, mut writer) = client.split();

    let reader = length_delimited::Builder::new()
        .little_endian()
        .new_read(reader);

    let reader = reader.map(|result| {
        result
            .map(|vec| Bytes::from(vec))
            .map_err(|_| ())
            .and_then(|buf| {
                MachineMessage::decode(buf).map_err(|_| ())
            })
            .expect("invalid machine message")
    });

    // use the client to await a protobuf event indicating that the printer has become ready
    let _message = reader
        .filter(|m|{
            if let Some(machine_message::Payload::Feedback(feedback)) = &m.payload {
                let is_ready = feedback.status == machine_message::Status::Ready as i32;
                future::ready(is_ready)
            } else {
                future::ready(false)
            }
        })
        .into_future()
        .await;


    eprintln!("The printer is ready");

    // create a file to spool to the printer
    let mut file = NamedTempFile::new()?;

    // move in a square pattern
    writeln!(file, "G90\nG1 X50 Y50\nG1 X25 Y50\nG1 Y25\nG1 X50")?;

    let message = CombinatorMessage {
        // message_id: 1,
        // ack_message_ids: vec![],
        // payload: Some(combinator_message::Payload::Reset(combinator_message::Reset {})),
        payload: Some(combinator_message::Payload::SpoolTask(combinator_message::SpoolTask {
            task_id: 123,
            client_id: 1337,
            content: Some(combinator_message::spool_task::Content::FilePath (
                file.path().to_str().unwrap().to_string(),
            )),
            machine_override: false,
        }))
    };

    let size = message.encoded_len();
    let size_delimiter = (size as i32).to_le_bytes();
    let mut buf = Vec::with_capacity(size);

    message.encode(&mut buf)?;

    // Write to the client.
    writer.write_all(&size_delimiter).await?;
    writer.write_all(&buf).await?;

    drop(writer);

    future::pending::<()>().await;

    // drop the client, then wait forever, then drop the file (preventing the file from being deleted early)
    // TODO: if we had some way to determine that the printer has ran the task here then we could properly drop the file
    // drop(reader);
    drop(file);

    Ok(())
}
