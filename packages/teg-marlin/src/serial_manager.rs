use anyhow::{
    anyhow,
    // Context as _,
};

// use futures_core::{ future, Poll };
use futures::{
    stream,
    // stream::SplitSink,
    TryStreamExt,
    StreamExt,
    SinkExt,
    FutureExt,
    // TryFutureExt,
    future:: {
        self,
        Either,
        AbortHandle,
        Future,
    },
    channel::mpsc,
};

use tokio::prelude::*;
// use futures_sink::Sink;
// use tokio::{
//     // prelude::*,
//     // timer::delay,
//     // sync::mpsc,
//     // stream::StreamExt as TokioStreamExt,
//     // sync::oneshot,
// };

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

use tokio_util::codec::Decoder;
// use std::sync::Arc;

// use bus_queue::async_::Publisher;

use crate::ResultExt;

pub struct SerialManager {
    settings: tokio_serial::SerialPortSettings,
    tty_path: String,

    event_sender: mpsc::Sender<Event>,
    gcode_sender: Option<mpsc::Sender<GCodeLine>>,
    abort_handle: Option<AbortHandle>,
}

impl SerialManager {
    pub fn new(
        event_sender: mpsc::Sender<Event>,
        tty_path: String,
    ) -> Self {
        info!("tty: {}", tty_path);

        let settings = tokio_serial::SerialPortSettings::default();

        Self {
            tty_path,
            settings,

            event_sender,
            gcode_sender: None,
            abort_handle: None,
        }
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
            .sink_map_err(|err| anyhow!("Serial Read SendError: {:?}", err));

        let reader_future = serial_reader
            .map_ok(|responses|
                stream::iter(responses).map(|r| Ok(r))
            )
            .try_flatten()
            .map_ok(|response| Event::SerialRec ( response ))
            .forward(reader_sender);

        let end_of_stream_event_sender = mpsc::Sender::clone(&self.event_sender);

        let serial_future = future::try_select(
            reader_future,
            sender_future,
        )
            .map(|either| {
                match either {
                    Ok(_) => {
                        Event::SerialPortDisconnected
                    }
                    Err(Either::Left((e, _))) => {
                        Event::SerialPortError { message: format!("{:?}", e) }
                    }
                    Err(Either::Right((e, _))) => {
                        Event::SerialPortError { message: format!("Serial port read error: {:?}", e) }
                    }
                }
            })
            .into_stream()
            .map(|event| Ok(event))
            .forward(end_of_stream_event_sender)
            .map(|_| ());

        let (serial_future, abort_handle) = futures::future::abortable(serial_future);
        self.abort_handle = Some(abort_handle);

        Ok(serial_future.map(|_| ()))
    }

    pub fn close(&mut self) {
        self.abort_handle.as_ref().map(|abort_handle| abort_handle.abort());

        self.abort_handle = None;
        self.gcode_sender = None;
    }

    pub async fn send(&mut self, gcode_line: GCodeLine) -> crate::Result<()> {
        if let Some(gcode_sender) = &mut self.gcode_sender {
            gcode_sender
                .send(gcode_line)
                .await
                .chain_err(|| "Unable to send to serial port")
        } else {
            Err("Unable to send. Serial port is not open.".into())
        }
    }
}
