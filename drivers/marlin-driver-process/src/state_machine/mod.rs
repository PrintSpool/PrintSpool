use std::time::Duration;

use crate::gcode_codec::{
    GCodeLine,
};

use nom_reprap_response::{
    Response,
};

use crate::protos::{
    // machine_message,
    // MachineMessage,
    server_message,
    ServerMessage,
};

mod ready_state;
mod context;
mod effect;
mod send_serial;

mod task;
pub use task::Task;

pub use context::Context;
pub use effect::Effect;
pub use send_serial::send_serial;

mod disconnect;
pub use disconnect::disconnect;

use ready_state::ReadyState;

#[derive(Clone, Debug)]
pub enum Event {
    Init { serial_port_available: bool },
    ConnectionTimeout,
    /// Send another M110 line number reset to try and initiate communication with the firmware
    RetryResetLineNumber,
    SerialPortOpened,
    SerialRec ((String, Response)),
    ProtobufClientConnection,
    ProtobufRec ( ServerMessage ),
    PollFeedback,
    TickleSerialPort,
    SerialPortDisconnected,
    SerialPortError{ message: String },
    GCodeLoaded(Task),
    GCodeLoadFailed{ task_id: crate::DbId, file_path: String },
}

#[derive(Clone, Debug)]
pub struct Connecting {
    baud_rate_candidates: Vec<u32>,
}

#[derive(Clone, Debug)]
pub enum State {
    Disconnected,
    Connecting (Connecting),
    Ready ( ReadyState ),
    Errored { message: String },
    EStopped,
}

pub struct Loop {
    pub next_state: State,
    pub effects: Vec<Effect>,
}

impl Loop {
    fn new(next_state: State, effects: Vec<Effect>) -> Self {
        Self {
            next_state,
            effects,
        }
    }
}

use State::*;
use Event::*;

pub fn cancel_all_tasks(state: &mut State, context: &mut Context) {
    if let Ready( ready_state ) = state {
        ready_state.tasks
            .iter()
            .for_each(|task| context.push_cancel_task(&task));

        ready_state.tasks.truncate(0);
    };
}

fn errored(message: String, state: &State, context: &mut Context) -> Loop {
    error!("Error State: {:?}", message);

    if let Ready( ReadyState { tasks, .. }) = state {
        tasks
            .iter()
            .for_each(|task| {
                context.push_error(&task);
            });
    };

    let next_state = Errored { message };
    context.handle_state_change(&next_state);

    let effects = vec![
        Effect::CancelAllDelays,
        Effect::SendFeedbackProtobuf,
    ];

    Loop::new(next_state, effects)
}

fn append_to_error(message: String, next_line: &String, context: &mut Context) -> Loop {
    let effects = vec![
        Effect::CancelAllDelays,
        Effect::SendFeedbackProtobuf,
    ];

    let message = format!("{}\n{}", message, next_line);

    let next_state = Errored { message };
    context.handle_state_change(&next_state);


    Loop::new(next_state, effects)
}

impl State {
    pub fn default_baud_rates() -> Vec<u32> {
        // baud rate candidates sorted by likelihood
        let mut baud_rates = vec![115_200, 250_000, 230_400, 57_600, 38_400, 19_200, 9_600];
        // Test order to see if baudrate detection works
        // let mut baud_rates = vec![250000, 230400, 57600, 38400, 19200, 9600, 115200];
        // let mut baud_rates = vec![115200];
        baud_rates.reverse();

        baud_rates
    }

    pub fn new_connection(baud_rate_candidates: Vec<u32>) -> Self {
        State::Connecting( Connecting { baud_rate_candidates })
    }

    fn and_no_effects(self) -> Loop {
        Loop {
            next_state: self,
            effects: vec![],
        }
    }

    fn invalid_transition_warning(self, event: &Event) -> Loop {
        warn!("Warning: received invalid event: {:?} in state: {:?}", event, self);

        self.and_no_effects()
    }

    fn invalid_transition_error(self, event: &Event, context: &mut Context) -> Loop {
        let message = format!("Invalid transition. State: {:?} Event: {:?}", self, event);

        errored(message, &self, context)
    }

    pub fn consume(mut self, event: Event, context: &mut Context) -> Loop {
        // trace!("event received {:?} in state {:?}", event, self);

        if let ProtobufClientConnection = &event {
            return Loop::new(
                self,
                vec![Effect::SendInitProtobuf, Effect::SendFeedbackProtobuf],
            )
        }

        if let GCodeLoadFailed { file_path, ..} = &event {
            let message = format!("Failed to load GCode: {:}", file_path);
            return errored(message, &self, context)
        }


        if let ProtobufRec( ServerMessage { payload } ) = &event {
            use server_message::*;

            match payload {
                Some(Payload::DeviceDiscovered(_)) => {
                    info!("Device Discovered");
                    // Due to the async nature of discovery the new port could be discovered before disconnecting from the old one.
                    // The state machine will automatically attempt to reconnect on disconnect to handle this edge case.
                    return if let Disconnected = self {
                        self.reconnect_with_next_baud(context)
                    } else {
                        self.and_no_effects()
                    }
                }
                Some(Payload::DeviceDisconnected(_)) => {
                    // Due to the async nature of discovery the new port could be discovered before disconnecting from the old one.
                    // The state machine will automatically attempt to reconnect on disconnect to handle this edge case.
                    return if let Disconnected = self {
                        self.and_no_effects()
                    } else {
                        disconnect(&self, context)
                    }
                }
                Some(Payload::DeleteTaskHistory( DeleteTaskHistory { task_ids })) => {
                    context.delete_task_history(task_ids);
                    return self.and_no_effects()
                }
                Some(Payload::Estop(_)) => {
                    info!("ESTOP");

                    cancel_all_tasks(&mut self, context);

                    context.handle_state_change(&State::EStopped);

                    return Loop::new(
                        State::EStopped,
                        vec![
                            Effect::CloseSerialPort,
                            Effect::OpenSerialPort { baud_rate: 19_200 },
                            Effect::CancelAllDelays,
                            Effect::SendFeedbackProtobuf,
                        ],
                    )
                }
                Some(Payload::Reset(_)) => {
                    info!("RESET: restarting service");

                    return Loop::new(
                        self,
                        vec![Effect::ExitProcess],
                    )
                }
                Some(Payload::ResetWhenIdle(_)) => {
                    let busy = if let Ready ( ready ) = &self {
                        ready.tasks.len() > 0
                    } else  {
                        false
                    };

                    return if busy {
                        context.reset_when_idle = true;

                        self.and_no_effects()
                    } else {
                        info!("RESET: restarting service");

                        Loop::new(
                            self,
                            vec![Effect::ExitProcess],
                        )
                    }
                }
                _ => ()
            }
        };

        if let Ready ( ready ) = self {
            ready.consume(event, context)
        } else {
            match event {
                Init { serial_port_available } => {
                    if context.controller.model.simulate {
                        info!("Teg Marlin: Started (Simulated serial port)");
                        self.reconnect_with_next_baud(context)
                    } else if serial_port_available {
                        info!("Teg Marlin: Started (Serial port found)");
                        self.reconnect_with_next_baud(context)
                    } else {
                        info!("Teg Marlin: Started (No device found)");
                        self.and_no_effects()
                    }
                }
                SerialPortOpened => {
                    match self {
                        Connecting(conn) => {
                            Self::reset_line_number(conn, context)
                        }
                        _ => {
                            self.invalid_transition_warning(&event)
                        }
                    }
                }
                SerialPortDisconnected => {
                    disconnect(&self, context)
                    // eprintln!("Disconnected");
                    // Loop::new(
                    //     Disconnected,
                    //     vec![Effect::CancelAllDelays],
                    // )
                }
                SerialPortError { message } => {
                    error!("Disconnected due to serial port error: {:?}", message);
                    errored(message.to_string(), &self, context)
                }
                /* Echo, Debug and Error function the same in all states */
                SerialRec((src, response)) => {
                    context.push_gcode_rx(src.clone(), false);

                    match (self, response) {
                        /* Errors */
                        (Errored { message }, _) => {
                            error!("RX ERR: {}", message);
                            append_to_error(message, &src, context)
                        }
                        (state, Response::Error(error)) => {
                            errored(error.to_string(), &state, context)
                        }
                        /* New socket */
                        (Connecting(conn), Response::Greeting) => {
                            Self::reset_line_number(conn, context)
                        }
                        (Connecting(Connecting {..}), response @ Response::Ok {..}) => {
                            Self::receive_ok(
                                SerialRec((src, response)),
                                context,
                            )
                        }
                        /* Invalid transitions */
                        (state, response @ Response::Resend { .. }) => {
                            let event = SerialRec(( src, response ));
                            state.invalid_transition_error(&event, context)
                        }
                        /* No ops */
                        (state, _) => state.and_no_effects()
                    }
                }
                ConnectionTimeout => {
                    self.connection_timeout(event, context)
                }
                /* Awaiting Greeting Timer: After Delay */
                RetryResetLineNumber => {
                    if let Connecting(conn) = self {
                        Self::reset_line_number(conn, context)
                    } else {
                        self.invalid_transition_error(&event, context)
                    }
                },
                /* Warnings */
                PollFeedback |
                TickleSerialPort |
                GCodeLoaded(..) |
                GCodeLoadFailed{..} |
                ProtobufRec(_) |
                ProtobufClientConnection => {
                    self.invalid_transition_warning(&event)
                }
                /* Errors */
                // _ => self.invalid_transition_error(&event)
            }
        }
    }

    fn reconnect_with_next_baud(self, context: &mut Context) -> Loop {
        // let connection_timeout_ms = if let Connecting(_) = self {
        //     5_000
        // } else {
        //     1_000
        // };
        let connection_timeout_ms = context.controller.model.serial_connection_timeout;

        let new_connection = if let Connecting(Connecting { .. }) = self {
            false
        } else {
            true
        };

        let mut baud_rate_candidates = match &self {
            Connecting(Connecting { baud_rate_candidates, .. }) => baud_rate_candidates.clone(),
            _ => {
                let mut new_candidates = vec![
                    context.controller.model.baud_rate.to_u32(),
                ];
                // prioritize the set baud rate in auto detection. That way we can cache the previous baud rate using
                // the baud_rate field. TODO: actually implement saving the previous baud rate
                if context.controller.model.automatic_baud_rate_detection {
                    new_candidates.extend(State::default_baud_rates());
                }
                new_candidates
            },
        };

        let baud_rate = baud_rate_candidates.pop();

        let mut effects = vec![
            Effect::CancelAllDelays,
        ];

        if let Some(baud_rate) = baud_rate {
            info!("Attempting to connect with baud rate: {:?}", baud_rate);
            context.baud_rate = baud_rate;

            effects.append(&mut vec![
                Effect::OpenSerialPort { baud_rate },
                Effect::Delay {
                    key: "connection_timeout".to_string(),
                    duration: Duration::from_millis(connection_timeout_ms),
                    event: ConnectionTimeout,
                },
            ]);

            let next_state = Self::new_connection(baud_rate_candidates);

            if new_connection {
                info!("Connecting to serial device...");
                context.handle_state_change(&next_state);
                effects.push(Effect::SendFeedbackProtobuf);
            }

            Loop::new(
                next_state,
                effects,
            )
        } else {
            info!("Unable to Connect");

            disconnect(&self, context)
        }
    }

    fn connection_timeout(self, event: Event, context: &mut Context) -> Loop {
        if let Connecting(_) = self {
            self.reconnect_with_next_baud(context)
        } else {
            self.invalid_transition_error(&event, context)
        }
    }

    fn receive_ok(event: Event, context: &mut Context) -> Loop {
        info!("Greeting Received");

        let mut effects = vec![
            Effect::CancelAllDelays,
        ];

        let ready = ReadyState::default();

        let next_state = Ready( ready );
        let mut next_loop = next_state.consume(event, context);

        effects.append(&mut next_loop.effects);
        next_loop.effects = effects;

        next_loop
    }

    fn reset_line_number(connecting: Connecting, context: &mut Context) -> Loop {
        let gcode = "M110 N0".to_string();

        // // Retries disabled for now because it breaks the Ender 3's printer startup. If it proves
        // // useful it can be re-added as an option.
        // let retry_key = "reset_line_number";
        let mut effects = vec![
            // Effect::CancelDelay { key: retry_key.to_string() },
            // Effect::Delay {
            //     key: retry_key.to_string(),
            //     duration: Duration::from_millis(100),
            //     event: Event::RetryResetLineNumber,
            // }
        ];

        send_serial(
            &mut effects,
            GCodeLine {
                gcode,
                line_number: None,
                checksum: true,
            },
            context,
            false,
        );

        Loop::new(
            State::Connecting(connecting),
            effects,
        )
    }
}
//
// #[cfg(test)]
// mod tests {
//     use super::*;
//
//     #[test]
//     fn runs_the_greeting_handshake() {
//         let state = State::new_connection(State::default_baud_rates());
//         let event = SerialRec( ResponsePayload::Greeting );
//         let mut context = Context::new();
//
//         let Loop { next_state, effects } = state.consume(event, &mut context);
//
//         if let [Effect::Delay { event: GreetingTimerCompleted, .. }] = effects[..] {
//         } else {
//             panic!("Expected Delay, got: {:?}", effects)
//         };
//
//         if let Connecting(Connecting { received_greeting: true, .. }) = next_state {
//         } else {
//             panic!("Expected Delay, got: {:?}", next_state)
//         };
//     }
//
//     #[test]
//     fn ignores_multiple_greetings(context: &Context) {
//         let state = State::Connecting(Connecting {
//             baud_rate_candidates: State::default_baud_rates(),
//             received_greeting: true,
//         });
//         let event = SerialRec( ResponsePayload::Greeting );
//         let mut context = Context::new();
//
//         let Loop { next_state:_, effects } = state.clone().consume(event, &mut context);
//
//         assert!(effects.is_empty());
//         // TODO: equality checks
//         // assert_eq!(state, next_state);
//     }
//
//     #[test]
//     fn starts_the_printer_after_the_greeting_timer() {
//         let state = State::Connecting(Connecting {
//             baud_rate_candidates: State::default_baud_rates(),
//             received_greeting: true,
//         });
//         let event = GreetingTimerCompleted;
//         let mut context = Context::new();
//
//         let Loop { next_state, effects } = state.consume(event, &mut context);
//
//         match &effects[..] {
//             [Effect::SendSerial (GCodeLine { gcode, .. }), Effect::Delay {..}] if gcode[..] == *"M110 N0" => {}
//             _ => panic!("Expected SendSerial {{ gcode: \"M110 N0\" }}, got: {:?}", effects)
//         }
//
//         if let Ready { .. } = next_state {
//         } else {
//             panic!("Expected Ready, got: {:?}", next_state)
//         };
//     }
//
// }
