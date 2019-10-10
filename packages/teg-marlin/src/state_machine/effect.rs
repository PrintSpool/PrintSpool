use std::{
    io::{
        BufReader,
        BufRead,
    },
    time::{
        Duration,
        Instant,
    },
};

use futures_util::{
    // stream::SplitSink,
    // StreamExt,
    SinkExt,
    future::{
        Abortable,
        AbortHandle,
        Aborted,
        // FutureExt,
    },
};

use tokio::{
    // prelude::*,
    timer::delay,
    sync::mpsc,
    // sync::oneshot,
};

use fallible_iterator::{
    FallibleIterator,
};

use prost::Message;
use bytes::Bytes;

use super::{
    Event,
    Task,
};

use crate::{
    gcode_codec::{
        GCodeLine,
        // ResponsePayload::Response,
    },
    // protos::{
    //     // machine_message,
    //     // MachineMessage,
    //     combinator_message,
    //     // CombinatorMessage,
    // },
    StateMachineReactor,
};

#[derive(Clone, Debug)]
pub enum Effect {
    Delay { key: String, duration: Duration, event: Event },
    CancelDelay { key: String },
    CancelAllDelays,
    SendSerial ( GCodeLine ),
    OpenSerialPort { baud_rate: u32 },
    // ResetSerial
    ProtobufSend,
    LoadGCode { file_path: String, task_id: u32, client_id: u32 },
    CloseSerialPort,
    ExitProcess,
}

impl Effect {
    pub async fn exec(
        self,
        reactor: &mut StateMachineReactor,
    ) {
        match self {
            Effect::Delay { key, event, duration, .. } => {
                let mut task_tx = mpsc::Sender::clone(&reactor.event_sender);
                let when = Instant::now() + duration;
                // create a handle for cancelling the delay
                let (abort_handle, abort_registration) = AbortHandle::new_pair();

                // cancel the previous delay of this key and replace it with a new cancel Sender for this delay
                reactor.delays.remove(&key).map(|previous| { previous.abort() });
                reactor.delays.insert(key, abort_handle);

                tokio::spawn(async move {
                    let abortable_delay = Abortable::new(delay(when), abort_registration);

                    if let Err(Aborted) = abortable_delay.await {
                        return
                    }

                    task_tx.send(event)
                        .await
                        .expect("Unable to send to printer event channel");
                });
            }
            Effect::CancelAllDelays => {
                for (_k, abort_handle) in reactor.delays.drain() {
                    abort_handle.abort()
                }
            }
            Effect::CancelDelay { key } => {
                if let Some(abort_handle) = reactor.delays.remove(&key) {
                    abort_handle.abort()
                }
            }
            // TODO: refactor startup and disconnect to share a new detect serial port effect
            // Effect::DetectSerialPort { baud_rate } => {
            //     if let Ok(serial_future) = reactor.serial_manager.open(baud_rate) {
            //         tokio::spawn(serial_future);
            //     }
            // }
            Effect::OpenSerialPort { baud_rate } => {
                if let Ok(serial_future) = reactor.serial_manager.open(baud_rate).await {
                    tokio::spawn(serial_future);
                } else {
                    reactor.event_sender.send(Event::SerialPortDisconnected).await
                        .expect("failed to send serial connection failure event");
                }
            }
            Effect::SendSerial ( gcode_line ) => {
                reactor.serial_manager.send_if_open(gcode_line).await;
                // tokio::spawn(async move {
                //     gcode_sender
                //         .send(gcode_line)
                //         .await
                //         .expect("Unable to send to serial channel");
                // });
            }
            Effect::ProtobufSend => {
                let message = reactor.context.machine_message_protobuf();

                let mut buf = Vec::with_capacity(message.encoded_len());
                message.encode(&mut buf).expect("machine message encoding failed");

                // println!("Protobuf TX ({:?} Bytes)", message.encoded_len());
                // println!("Protobuf TX ({:?} Bytes): {:#?}", message.encoded_len(), message.payload);

                reactor.protobuf_broadcast
                    .send(Bytes::from(buf))
                    .await
                    .expect("machine message send failed");
            }
            Effect::LoadGCode { file_path, task_id, client_id } => {
                let mut tx = mpsc::Sender::clone(&reactor.event_sender);

                let gcode_lines = std::fs::File::open(file_path)
                    .map(|file| BufReader::new(file).lines())
                    .map(|iter| fallible_iterator::convert(iter))
                    .and_then(|iter| {
                        iter
                            .collect::<Vec<_>>()
                            .map(|v| v.into_iter())
                    });

                let event = if let Ok(gcode_lines) = gcode_lines {
                    Event::GCodeLoaded(
                        Task {
                            id: task_id,
                            client_id,
                            gcode_lines,
                        }
                    )
                } else {
                    Event::GCodeLoadFailed { task_id }
                };

                tx.send(event)
                    .await
                    .expect("printer event channel send failed");

            }
            Effect::CloseSerialPort => {
                reactor.serial_manager.close();
            }
            Effect::ExitProcess => {
                reactor.serial_manager.close();
                std::process::exit(0);
            }
            // _ => ()
        }
    }
}
