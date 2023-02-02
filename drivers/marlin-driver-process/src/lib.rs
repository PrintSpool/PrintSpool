#![crate_type = "lib"]
#![crate_name = "printspool_marlin"]
#![type_length_limit="1073741824"]

#[macro_use] extern crate tracing;
#[macro_use] extern crate error_chain;
#[macro_use] extern crate lazy_static;

mod protobuf_server;
pub mod gcode_codec;
mod serial_manager;
mod serial_simulator;

pub mod state_machine;
pub mod gcode_parser;

pub mod protos {
    pub use printspool_protobufs::*;
}

pub use serial_manager::SerialManager;
pub use printspool_machine::config::MachineConfig;

use std::{collections::HashMap, path::PathBuf};
use chrono::prelude::*;
// use std::sync::{Arc, Mutex};

// use futures_core::{ future, Poll };
// use eyre::{
//     // eyre,
//     // Context as _,
//     Result,
// };
use futures::{
    // stream::SplitSink,
    StreamExt,
    // SinkExt,
    // future::FutureExt,
    future::{AbortHandle},
    channel::mpsc,
    sink::SinkExt,
};
// // use futures_sink::Sink;
// use tokio::{
//     // prelude::*,
//     // timer::delay,
//     // sync::mpsc,
//     // sync::oneshot,
//     // stream::StreamExt as TokioStreamExt,
// };

use bytes::Bytes;
// use bytes::BufMut;

use {
    state_machine::{Loop, State, Event, Context},
    // protos::MachineMessage,
};


// use futures::compat::{
//     Sink01CompatExt,
// };
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

pub type DbId = printspool_json_store::DbId;

// Create the Error, ErrorKind, ResultExt, and Result types
error_chain! {}

// type SerialSender = Arc<Mutex<SplitSink<tokio::codec::Framed<tokio_serial::Serial, GCodeCodec>, GCodeLine>>>;
// type SerialSender = mpsc::Sender<GCodeLine>;


lazy_static! {
    pub static ref PROCESS_STARTED_AT: DateTime<Utc> = Utc::now();
}

pub struct StateMachineReactor {
    pub event_sender: mpsc::Sender<Event>,
    pub protobuf_broadcast: bus_queue::flavors::arc_swap::Publisher<Bytes>,
    pub serial_manager: SerialManager,
    pub delays: HashMap<String, AbortHandle>,
    pub context: Context,
}

async fn tick_state_machine(
    state: State,
    event: Event,
    reactor: &mut StateMachineReactor,
) -> State {
    trace!("Received Event:  {:#?}", event);

    let Loop{ next_state, effects } = state.consume(event, &mut reactor.context);

    trace!("Next State: {:#?}", next_state);
    trace!("Effects: {:#?}", effects);

    for effect in effects.into_iter() {
        effect.exec(reactor).await;
    };

    next_state
}

pub async fn start(
    config_path: PathBuf,
) -> eyre::Result<()> {
    lazy_static::initialize(&PROCESS_STARTED_AT);
    dotenv::dotenv().ok();

    tracing_subscriber::fmt::init();
    color_eyre::install()?;

    // Config
    // ----------------------------------------------------
    let config_file_content = std::fs::read_to_string(config_path.clone())
        .expect(&format!("Unabled to open config (file: {:?})", config_path));

    let config: MachineConfig = toml::from_str(&config_file_content)
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
    let (protobuf_broadcast, protobuf_recv) = bus_queue::flavors::arc_swap::bounded(10);

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
