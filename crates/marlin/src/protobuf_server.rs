use std::{fs, path::PathBuf};

// use futures::compat::{
//     Stream01CompatExt,
// };

use futures::{
    future,
    // FutureExt,
    StreamExt,
    SinkExt,
    TryStreamExt,
    channel::mpsc,
};

use tokio_util::codec::{
    length_delimited,
    Framed,
};

// use bytes::BufMut;

use tokio::{
    net::UnixListener,
    // sync::mpsc,
};

use teg_protobufs::Message;
use bytes::Bytes;

use crate::protos::{
    // MachineMessage,
    ServerMessage,
    // server_message,
};

use crate::state_machine::Event;

async fn handle_connection(
    mut channel_sender: mpsc::Sender<Event>,
    broadcast_subscriber: bus_queue::flavors::arc_swap::Subscriber<Bytes>,
    connection: tokio::net::UnixStream,
) {
    let mut connection_event_sender = mpsc::Sender::clone(&channel_sender);

    let codec = length_delimited::Builder::new()
        .little_endian()
        .new_codec();

    let ( mut socket_sender, socket_reader ) = Framed::new(connection, codec).split();

    let mut broadcast_subscriber = broadcast_subscriber
        .clone()
        // .compat()
        // .map_err(|err| {
        //     error!("Send Error: {:?}", err);
        //     ()
        // })
        // .take_while(|result| {
        //     future::ready(result.is_ok())
        // })
        .inspect(|_| trace!("Protobuf Sent"))
        .map(|result| Ok(Bytes::clone(&*result)));

    // Read from the server. TODO: Switch to read_to_end.
    // let mut buf = [0u8; 5];
    let mut read_stream = socket_reader
        .map_err(|e| {
            error!("Error receiving Teg Protobuf: {:?}", e);
            ()
        })
        .and_then(move |buf| -> future::Ready<Result<Event, ()>> {
            let decoded_result = ServerMessage::decode(buf);

            if let Ok(message) = decoded_result {
                future::ok(Event::ProtobufRec( message ))
            } else {
                error!("Unable to decode combinator message: {:?}", decoded_result);
                future::err(())
            }
        })
        .take_while(|result| {
            future::ready(result.is_ok())
        })
        .map(|result| Ok(result.unwrap()));

    // NodeJS sometimes needs a delay after opening the unix socket to prevent it from dropping the first message
    // See: https://github.com/nodejs/help/issues/521
    tokio::spawn(async move {
        // debug!("New connection received. Waiting 100ms.");

        // tokio::time::delay_for(Duration::from_millis(100)).await;

        debug!("New protobuf socket connection received");

        connection_event_sender.send(Event::ProtobufClientConnection).await
            .expect("Unable to send connection event");

        // tokio::time::delay_for(Duration::from_millis(500)).await;

        // connection_event_sender.send(Event::ProtobufClientConnection).await
        //     .expect("Unable to send connection event");

        info!("Socket Ready");
    });

    let _ = futures::future::select(
        socket_sender.send_all(&mut broadcast_subscriber),
        channel_sender.send_all(&mut read_stream),
    ).await;

    info!("Socket Closed");
}

pub async fn serve(
    socket_path: &PathBuf,
    channel_sender: &mpsc::Sender<Event>,
    broadcast_subscriber: bus_queue::flavors::arc_swap::Subscriber<Bytes>,
) -> eyre::Result<()> {

    info!("Socket: {:?}", socket_path);

    // delete the previous socket if one exists
    let _ = fs::remove_file(socket_path);

    let listener = UnixListener::bind(&socket_path)
        .expect("Unable to create unix socket");

    let channel_sender_clone = channel_sender.clone();

    tokio::spawn(async move {
        loop {
            let connection = listener.accept().await.unwrap().0;
            let connection_channel_sender = channel_sender_clone.clone();

            let broadcast_clone = broadcast_subscriber.clone();

            tokio::spawn(async move {
                handle_connection(
                    connection_channel_sender,
                    broadcast_clone,
                    connection,
                ).await;
            });
        }
    });

    Ok(())
}
