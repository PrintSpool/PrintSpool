#![crate_type = "lib"]
#![crate_name = "teg_marlin"]

#![feature(async_closure)]

extern crate bytes;
// #[macro_use]
extern crate futures_core;
extern crate futures_util;
extern crate tokio;
extern crate tokio_serial;
// #[macro_use]
// extern crate combine;
extern crate bus_queue;

mod protobuf_server;
mod gcode_codec;
mod serial_manager;

pub mod state_machine;

pub mod protos {
    include!(concat!(env!("OUT_DIR"), "/teg_protobufs.rs"));
}

pub use serial_manager::SerialManager;

use std::collections::HashMap;
// use std::sync::{Arc, Mutex};

// use futures_core::{ future, Poll };

use futures_util::{
    // stream::SplitSink,
    StreamExt,
    // SinkExt,
    // future::FutureExt,
    future::{AbortHandle},
};
// use futures_sink::Sink;
use tokio::{
    // prelude::*,
    // timer::delay,
    sync::mpsc,
    // sync::oneshot,
};

use bytes::Bytes;
// use bytes::BufMut;

use {
    state_machine::{Loop, State, Event, Context},
    // protos::MachineMessage,
};


use futures_util::compat::{
    Sink01CompatExt,
};
// use {
//     futures_core::{
//         future::{
//             Future,
//             TryFuture,
//         },
//         stream::Stream,
//     },
// };

// use std::sync::Arc;

// use bus_queue::async_::Publisher;

// type SerialSender = Arc<Mutex<SplitSink<tokio::codec::Framed<tokio_serial::Serial, GCodeCodec>, GCodeLine>>>;
// type SerialSender = mpsc::Sender<GCodeLine>;

pub struct StateMachineReactor {
    pub event_sender: mpsc::Sender<Event>,
    pub protobuf_broadcast: futures_util::compat::Compat01As03Sink<bus_queue::async_::Publisher<Bytes>, Bytes>,
    pub serial_manager: SerialManager,
    pub delays: HashMap<String, AbortHandle>,
    pub context: Context,
}

async fn tick_state_machine(
    state: State,
    event: Event,
    reactor: &mut StateMachineReactor,
) -> State {
    // println!("IN  {:?}", event);
    let Loop{ next_state, effects } = state.consume(event, &mut reactor.context);

    // println!("OUT {:?} {:?}", next_state, effects);

    for effect in effects.into_iter() {
        effect.exec(reactor).await;
    };

    next_state
}

pub async fn start(_tty_path: Option<String>) -> Result<(), Box<dyn std::error::Error>> {
    // Channels
    // ----------------------------------------------------
    let (mut event_sender, event_reader) = mpsc::channel::<Event>(100);

    // Serial Port
    // ----------------------------------------------------
    let serial_manager = SerialManager::new(event_sender.clone(), None);

    // attempt to connect to serial on startup if the port is available
    event_sender.send(Event::Init)
        .await
        .expect("Unable to send init event");

    // Protobuf Server
    // ----------------------------------------------------
    let (protobuf_broadcast, protobuf_recv) = bus_queue::async_::channel(1);

    let protobuf_broadcast = protobuf_broadcast.sink_compat();
    let protobuf_sender = mpsc::Sender::clone(&event_sender);

    protobuf_server::serve(&protobuf_sender, protobuf_recv)
        .await
        .expect("Error starting teg protobuf server error");

    // Reactor
    // ----------------------------------------------------
    let reactor = StateMachineReactor {
        protobuf_broadcast,
        event_sender,
        serial_manager,
        delays: HashMap::new(),
        context: Context::new(),
    };

    // Glue Code
    // ----------------------------------------------------
    tokio::spawn(async move {
        let initial_acc = (
            State::Disconnected,
            reactor,
        );

        event_reader
            .fold(initial_acc, async move |acc, message| {
                let (state, mut reactor) = acc;

                let next_state = tick_state_machine(
                    state,
                    message,
                    &mut reactor,
                ).await;

                (next_state, reactor)
            })
            .await;
    });

    Ok(())
}
