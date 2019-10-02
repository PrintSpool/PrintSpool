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
        AbortHandle
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
        // ResponsePayload::Response,
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

pub struct SerialManager {
    settings: tokio_serial::SerialPortSettings,
    tty_path: String,

    event_sender: tokio::sync::mpsc::Sender<Event>,
    gcode_sender: Option<tokio::sync::mpsc::Sender<GCodeLine>>,
    abort_handle: Option<AbortHandle>,
}

impl SerialManager {
    pub fn new(
        event_sender: tokio::sync::mpsc::Sender<Event>,
        tty_path: String,
    ) -> Self {
        println!("tty: {}", tty_path);

        let settings = tokio_serial::SerialPortSettings::default();

        Self {
            tty_path,
            settings,

            event_sender,
            gcode_sender: None,
            abort_handle: None,
        }

        // TODO: connect to the serial port at some point? Could be here for now but will probably
        // need to moved to accomidate connect/disconnect logic.
    }

    pub async fn open(&mut self, baud_rate: u32) -> Result<impl Future<Output = ()>, std::io::Error> {
        self.close();

        use std::{thread, time};

        // the serial port needs a moment to reset when reconnecting
        thread::sleep(time::Duration::from_millis(100));

        self.settings.baud_rate = baud_rate;

        let mut port = tokio_serial::Serial::from_path(
            self.tty_path.clone(),
            &self.settings
        )?;

        // #[cfg(unix)]
        port.set_exclusive(false)?;

        port.write_all(&[b'\n']).await?;

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
                    Ok(response) => Ok(Event::SerialRec ( response )),
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

        let (serial_future, abort_handle) = futures_util::future::abortable(serial_future);
        self.abort_handle = Some(abort_handle);

        Ok(serial_future.map(|_| ()))
    }

    pub fn close(&mut self) {
        self.abort_handle.as_ref().map(|abort_handle| abort_handle.abort());

        self.abort_handle = None;
        self.gcode_sender = None;
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
