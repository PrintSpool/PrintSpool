use std::{
    io::{
        BufReader,
        BufRead,
    },
    time::{
        Duration,
        // Instant,
    },
};

use futures::{
    // stream::SplitSink,
    // StreamExt,
    SinkExt,
    future::{
        Abortable,
        AbortHandle,
        Aborted,
        // FutureExt,
    },
    channel::mpsc,
};

// use tokio::{
//     // prelude::*,
//     sync::mpsc,
//     // sync::oneshot,
// };

use fallible_iterator::{
    FallibleIterator,
};

use teg_protobufs::{MachineFlags, Message};
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
    //     server_message,
    //     // ServerMessage,
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
    SendInitProtobuf,
    SendFeedbackProtobuf,
    LoadGCode {
        file_path: String,
        task_id: crate::DbId,
        client_id: crate::DbId,
        machine_override: bool,
        despooled_line_number: Option<u32>,
    },
    CloseSerialPort,
    ExitProcess,
    ExitProcessAfterDelay,
}

impl Effect {
    pub async fn exec(
        self,
        reactor: &mut StateMachineReactor,
    ) {
        match self {
            Effect::Delay { key, event, duration, .. } => {
                let mut task_tx = mpsc::Sender::clone(&reactor.event_sender);
                // create a handle for cancelling the delay
                let (abort_handle, abort_registration) = AbortHandle::new_pair();

                // cancel the previous delay of this key and replace it with a new cancel Sender for this delay
                reactor.delays.remove(&key).map(|previous| { previous.abort() });
                reactor.delays.insert(key, abort_handle);

                tokio::spawn(async move {
                    let abortable_delay = Abortable::new(
                        tokio::time::sleep(duration),
                        abort_registration,
                    );

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
                if let Ok(serial_future) = reactor.serial_manager.open(
                    baud_rate,
                    reactor.context.controller.model.simulate,
                ).await {
                    tokio::spawn(serial_future);
                } else {
                    reactor.event_sender.send(Event::SerialPortDisconnected).await
                        .expect("failed to send serial connection failure event");
                }
            }
            Effect::SendSerial ( gcode_line ) => {
                reactor.serial_manager
                    .send(gcode_line)
                    .await
                    .unwrap();
            }
            Effect::SendInitProtobuf => {
                use teg_protobufs::{
                    MachineMessage,
                    machine_message::{ Payload, Init },
                };

                // Create a protobuf init message
                let message = MachineMessage {
                    payload: Some(Payload::Init (Init {
                        process_started_at_nanos: crate::PROCESS_STARTED_AT.timestamp_nanos(),
                    })),
                };

                let mut buf = Vec::with_capacity(message.encoded_len());
                message.encode(&mut buf).expect("machine message encoding failed");

                reactor.protobuf_broadcast
                    .send(Bytes::from(buf))
                    .await
                    .expect("machine message send failed");
            }
            Effect::SendFeedbackProtobuf => {
                use teg_protobufs::{
                    MachineMessage,
                    machine_message::{ Feedback, Payload },
                };

                // Update the feedback
                reactor.context.add_gcode_history_to_feedback();

                // take the feedback from reactor.context
                let mut feedback = std::mem::replace(
                    &mut reactor.context.feedback,
                    Feedback::default(),
                );

                feedback.machine_flags = reactor.context.machine_flags.bits();

                // Create a protobuf message around the feedback
                let message = MachineMessage {
                    payload: Some(Payload::Feedback (
                        feedback,
                    )),
                };

                let mut buf = Vec::with_capacity(message.encoded_len());
                message.encode(&mut buf).expect("machine message encoding failed");

                // re-store the feedback in reactor.context
                if let Some(Payload::Feedback(feedback)) = message.payload {
                    reactor.context.feedback = feedback;
                } else {
                    panic!("Feedback protobuf did not contain the expected payload");
                }

                // eprintln!("Protobuf TX ({:?} Bytes)", message.encoded_len());
                // eprintln!("Protobuf TX ({:?} Bytes): {:#?}", message.encoded_len(), message.payload);

                reactor.protobuf_broadcast
                    .send(Bytes::from(buf))
                    .await
                    .expect("machine message send failed");

                // Reset the PAUSED_STATE flag after the protobuf has been sent
                reactor.context.machine_flags.set(MachineFlags::PAUSED_STATE, false);
            }
            Effect::LoadGCode {
                file_path,
                task_id,
                client_id,
                machine_override,
                despooled_line_number,
            } => {
                let mut tx = mpsc::Sender::clone(&reactor.event_sender);

                let file_path = reactor.context.config.transform_gcode_file_path(file_path);

                let gcode_lines = std::fs::File::open(&file_path)
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
                            machine_override,
                            started: false,
                            despooled_line_number,
                        }
                    )
                } else {
                    Event::GCodeLoadFailed { task_id, file_path }
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
            Effect::ExitProcessAfterDelay => {
                tokio::time::sleep(Duration::from_millis(500)).await;

                reactor.serial_manager.close();
                std::process::exit(0);
            }
            // _ => ()
        }
    }
}
