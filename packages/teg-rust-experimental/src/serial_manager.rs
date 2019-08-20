extern crate bytes;
// #[macro_use]
extern crate futures_core;
extern crate futures_util;
extern crate tokio;
extern crate tokio_serial;
// #[macro_use]
// extern crate combine;
extern crate bus_queue;

// use futures_core::{ future, Poll };

use futures_util::{
    // stream::SplitSink,
    // TryStreamExt,
    // StreamExt,
    // SinkExt,
    // FutureExt,
    // TryFutureExt,
    try_future,
    future:: {
        // self,
        Either,
    },
};
use futures_core::{
    Future,
};

// use futures_sink::Sink;
use tokio::{
    prelude::*,
    // timer::delay,
    sync::mpsc,
    // sync::oneshot,
};

use crate::{
    state_machine::{
        Event,
    },
    gcode_codec::{
        GCodeCodec,
        // response::Response,
        GCodeLine
    },
    // protos::MachineMessage,
};

// use futures_util::compat::{
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

use tokio::codec::Decoder;
// use std::sync::Arc;

// use bus_queue::async_::Publisher;

#[cfg(unix)]
const DEFAULT_TTY: &str = "/dev/ttyUSB0";
#[cfg(windows)]
const DEFAULT_TTY: &str = "COM1";

pub struct SerialManager {
    settings: tokio_serial::SerialPortSettings,
    tty_path: String,

    event_sender: tokio::sync::mpsc::Sender<Event>,
    gcode_sender: Option<tokio::sync::mpsc::Sender<GCodeLine>>,
}

impl SerialManager {
    pub fn new(
        event_sender: tokio::sync::mpsc::Sender<Event>,
        tty_path: Option<String>,
    ) -> Self {
        let tty_path = tty_path.unwrap_or_else(|| DEFAULT_TTY.into());
        let settings = tokio_serial::SerialPortSettings::default();

        Self {
            tty_path,
            settings,

            event_sender,
            gcode_sender: None,
        }

        // TODO: connect to the serial port at some point? Could be here for now but will probably
        // need to moved to accomidate connect/disconnect logic.
    }

    pub fn open(&mut self, baud_rate: u32) -> Result<impl Future<Output = ()>, std::io::Error> {
        self.settings.baud_rate = baud_rate;
        // TODO: abort handle
        // self.serial_abort_handle.map(|abort_handle| abort_handle.abort());

        let mut port = tokio_serial::Serial::from_path(
            self.tty_path.clone(),
            &self.settings
        )?;

        // #[cfg(unix)]
        port.set_exclusive(false)?;

        let (serial_sender, serial_reader) = GCodeCodec.framed(port).split();

        let (gcode_sender, gcode_repeater_inner) = mpsc::channel::<GCodeLine>(100);
        self.gcode_sender = Some(gcode_sender);

        let sender_future = gcode_repeater_inner
            .map(|gcode| Ok(gcode))
            .forward(serial_sender);

        let reader_sender = mpsc::Sender::clone(&self.event_sender)
            .sink_map_err(|error| {
                use std::io::{ Error, ErrorKind };

                let message = format!("Event Sender Error: {:?}", error);
                Error::new(ErrorKind::Other, message)
            });

        let reader_future = serial_reader
            .map(|result| {
                use std::io::{ Error, ErrorKind };

                match result {
                    Ok(message) => Ok(Event::SerialRec ( message )),
                    Err(error) => {
                        let message = format!("Serial Reader Error: {:?}", error);
                        Err(Error::new(ErrorKind::Other, message))
                    },
                }
            })
            .forward(reader_sender);

        let end_of_stream_event_sender = mpsc::Sender::clone(&self.event_sender);

        let serial_future = try_future::try_select(
            reader_future,
            sender_future,
        )
            .map(|either| {
                match either {
                    // Ok(_) => {
                    //     println!("the serial port just kinda went away?")
                    // }
                    Ok(_) => {
                        Event::SerialPortDisconnected
                    }
                    Err(Either::Left((e, _))) => {
                        Event::SerialPortError { message: format!("Serial port send error: ${:?}", e) }
                    }
                    Err(Either::Right((e, _))) => {
                        Event::SerialPortError { message: format!("Serial port read error: ${:?}", e) }
                    }
                }
            })
            .into_stream()
            .map(|event| Ok(event))
            .forward(end_of_stream_event_sender)
            .map(|_| ());

        Ok(serial_future)
    }

    pub async fn send_if_open(&mut self, gcode_line: GCodeLine) {
        if let Some(gcode_sender) = &mut self.gcode_sender {
            let _ = gcode_sender
                .send(gcode_line)
                .await
                .map_err(|_err| {
                    // TODO: abort the serial connection on send error
                    ()
                });
        }
    }
}