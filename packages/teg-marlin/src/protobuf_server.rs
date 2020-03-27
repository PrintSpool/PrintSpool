use std::{
    fs,
    time::{
        Duration,
        Instant,
    },
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
    timer,
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
    let mut connection_event_sender = mpsc::Sender::clone(&channel_sender);

    let codec = length_delimited::Builder::new()
        .little_endian()
        .new_codec();

    let ( mut socket_sender, socket_reader ) = Framed::new(connection, codec).split();

    let mut broadcast_subscriber = broadcast_subscriber
        .clone()
        .compat()
        .take_while(|result| {
            future::ready(result.is_ok())
        })
        // .inspect(|result| eprintln!("SENDING PROTOBUF {:?}", result.clone().unwrap()))
        .map(|result| Bytes::clone(&*result.unwrap()));

    // Read from the server. TODO: Switch to read_to_end.
    // let mut buf = [0u8; 5];
    let mut read_stream = socket_reader
        .map_err(|_| ())
        .and_then(move |buf| -> future::Ready<Result<Event, ()>> {
            if let Ok(message) = CombinatorMessage::decode(buf) {
                future::ok(Event::ProtobufRec( message ))
            } else {
                eprintln!("Warning: Unable to decode combinator message");
                future::err(())
            }
        }).take_while(|result| {
            future::ready(result.is_ok())
        }).map(|result| result.unwrap());

    // NodeJS sometimes needs a delay after opening the unix socket to prevent it from dropping the first message
    // See: https://github.com/nodejs/help/issues/521
    tokio::spawn(async move {
        // eprintln!("New connection starting delay!");
        timer::delay(Instant::now() + Duration::from_millis(100)).await;

        connection_event_sender.send(Event::ProtobufClientConnection).await
            .expect("Unable to send connection event");

        timer::delay(Instant::now() + Duration::from_millis(500)).await;

        connection_event_sender.send(Event::ProtobufClientConnection).await
            .expect("Unable to send connection event");
        eprintln!("Socket Ready");
    });

    let _ = futures_util::future::select(
        socket_sender.send_all(&mut broadcast_subscriber),
        channel_sender.send_all(&mut read_stream),
    ).await;

    eprintln!("Socket Closed");
}

pub async fn serve(
    socket_path: &String,
    channel_sender: &mpsc::Sender<Event>,
    broadcast_subscriber: bus_queue::async_::Subscriber<Bytes>,
) -> std::io::Result<()> {

    eprintln!("socket: {:?}", socket_path);

    // delete the previous socket if one exists
    let _ = fs::remove_file(socket_path);

    let listener = UnixListener::bind(&socket_path)
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
