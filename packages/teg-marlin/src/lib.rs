#![crate_type = "lib"]
#![crate_name = "teg_marlin"]

#[macro_use] extern crate log;
#[macro_use] extern crate error_chain;

extern crate bytes;
extern crate futures_core;
extern crate futures_util;
extern crate tokio;
extern crate tokio_serial;
// extern crate combine;
extern crate bus_queue;
extern crate serde;
extern crate toml;
extern crate gcode;

mod protobuf_server;
mod gcode_codec;
mod serial_manager;

pub mod state_machine;
pub mod configuration;
pub mod gcode_parser;

pub mod protos {
    mod teg_protobufs;

    pub use teg_protobufs::*;
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

// Create the Error, ErrorKind, ResultExt, and Result types
error_chain! {}

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
    trace!("Received Event:  {:?}", event);

    let Loop{ next_state, effects } = state.consume(event, &mut reactor.context);

    trace!("Next State: {:?}", next_state);
    trace!("Effects: {:?}", effects);

    for effect in effects.into_iter() {
        effect.exec(reactor).await;
    };

    next_state
}

pub async fn start(
    config_path: Option<String>
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    pretty_env_logger::init();

    // Config
    // ----------------------------------------------------
    let config_path = config_path.unwrap_or("/etc/teg/machine.toml".to_string());

    let config_file_content = std::fs::read_to_string(config_path.clone())
        .expect(&format!("Unabled to open config (file: {:?})", config_path));

    let config: configuration::Config = toml::from_str(&config_file_content)
        .expect(&format!("Invalid config format (file: {:?})", config_path));

    // Channels
    // ----------------------------------------------------
    let (mut event_sender, event_reader) = mpsc::channel::<Event>(100);

    // Serial Port
    // ----------------------------------------------------
    let serial_manager = SerialManager::new(event_sender.clone(), config.tty_path().clone());

    // attempt to connect to serial on startup if the port is available
    let serial_port_available = std::path::Path::new(config.tty_path()).exists();
    event_sender.send(Event::Init { serial_port_available })
        .await
        .expect("Unable to send init event");

    // Protobuf Server
    // ----------------------------------------------------
    let (protobuf_broadcast, protobuf_recv) = bus_queue::async_::channel(1);

    let protobuf_broadcast = protobuf_broadcast.sink_compat();
    let protobuf_sender = mpsc::Sender::clone(&event_sender);

    let socket_path = config.socket_path();
    protobuf_server::serve(&socket_path, &protobuf_sender, protobuf_recv)
        .await
        .expect("Error starting teg protobuf server error");

    // Reactor
    // ----------------------------------------------------
    let reactor = StateMachineReactor {
        protobuf_broadcast,
        event_sender,
        serial_manager,
        delays: HashMap::new(),
        context: Context::new(config),
    };

    // Glue Code
    // ----------------------------------------------------
    let initial_acc = (
        State::Disconnected,
        reactor,
    );

    event_reader
        .fold(initial_acc, move |acc, message| async {
            let (state, mut reactor) = acc;

            let next_state = tick_state_machine(
                state,
                message,
                &mut reactor,
            ).await;

            (next_state, reactor)
        })
        .await;

    Ok(())
}
