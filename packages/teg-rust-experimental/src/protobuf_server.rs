use std::{
    env,
    fs,
};

use futures_util::compat::{
    Stream01CompatExt,
};

use futures_util::{
    future,
    FutureExt,
    StreamExt,
    SinkExt,
    TryStreamExt,
};

use tokio_net::uds::*;
// use tokio::io::{
//     // AsyncReadExt,
//     AsyncWriteExt,
// };
use tokio::codec::{
    length_delimited,
    Framed,
};

// use bytes::BufMut;

use tokio::{
    sync::mpsc,
};

use prost::Message;
use bytes::Bytes;

use crate::protos::{
    // MachineMessage,
    CombinatorMessage,
    // combinator_message,
};

use crate::state_machine::Event;

async fn handle_connection(
    mut channel_sender: mpsc::Sender<Event>,
    broadcast_subscriber: bus_queue::async_::Subscriber<Bytes>,
    connection: tokio::net::UnixStream,
) {
    println!("New connection!");
    let codec = length_delimited::Builder::new()
        .little_endian()
        .new_codec();

    let ( mut socket_sender, socket_reader ) = Framed::new(connection, codec).split();

    let mut broadcast_subscriber = broadcast_subscriber
        .clone()
        .compat()
        .take_while(|result| {
            future::ready(result.is_ok())
        }).map(|result| Bytes::clone(&*result.unwrap()));

    // Read from the server. TODO: Switch to read_to_end.
    // let mut buf = [0u8; 5];
    let mut read_stream = socket_reader
        .map_err(|_| ())
        .and_then(move |buf| -> future::Ready<Result<Event, ()>> {
            if let Ok(message) = CombinatorMessage::decode(buf) {
                future::ok(Event::ProtobufRec( message ))
            } else {
                future::err(())
            }
        }).take_while(|result| {
            future::ready(result.is_ok())
        }).map(|result| result.unwrap());

    futures_util::future::select(
        channel_sender.send_all(&mut read_stream),
        socket_sender.send_all(&mut broadcast_subscriber),
    ).await;

    println!("Connection Closed");
}

pub async fn serve(
    channel_sender: &mpsc::Sender<Event>,
    broadcast_subscriber: bus_queue::async_::Subscriber<Bytes>,
) -> std::io::Result<()> {
    let mut sock_path = env::current_exe()?;
    sock_path.pop();
    sock_path.push("machine.sock");
    let sock_path = sock_path.as_os_str();

    println!("socket: {:?}", sock_path);

    // delete the previous socket if one exists
    let _ = fs::remove_file(sock_path);

    let listener = UnixListener::bind(&sock_path)
        .expect("Unable to create unix socket")
        .incoming();

    let initial_channel_sender = mpsc::Sender::clone(channel_sender);

    tokio::spawn(listener.fold(
        initial_channel_sender,
        move |next_channel_sender, result| {
            let connection_channel_sender = mpsc::Sender::clone(&next_channel_sender);

            let broadcast_clone = broadcast_subscriber.clone();
            let connection = result.unwrap();

            tokio::spawn(async move {
                handle_connection(connection_channel_sender, broadcast_clone, connection).await;
            });

            future::ready(next_channel_sender)
        }
    ).map(|_| ()));

    Ok(())
}
