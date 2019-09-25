use std::time::Duration;

use crate::gcode_codec::{
    GCodeLine,
    response::Response,
};

use crate::protos::{
    // machine_message,
    // MachineMessage,
    combinator_message,
    CombinatorMessage,
};

mod ready_state;
mod context;
mod effect;

pub use context::Context;
pub use effect::Effect;

use ready_state::ReadyState;

#[derive(Clone, Debug)]
pub struct Task
{
    pub id: u32,
    // TODO: gcode_lines iterator. Does 'self lifetime do what I need?
    // gcode_lines: Option<Box<dyn std::slice::Iter<T: str>>>,
    pub gcode_lines: std::vec::IntoIter<String>,
}

#[derive(Clone, Debug)]
pub enum Event {
    Init { serial_port_available: bool },
    ConnectionTimeout,
    GreetingTimerCompleted,
    SerialRec ( Response ),
    ProtobufClientConnection,
    ProtobufRec ( CombinatorMessage ),
    PollFeedback,
    TickleSerialPort,
    SerialPortDisconnected,
    SerialPortError{ message: String },
    GCodeLoaded(Task),
    GCodeLoadFailed{ task_id: u32 },
}

#[derive(Clone, Debug)]
pub struct Connecting {
    baud_rate_candidates: Vec<u32>,
    received_greeting: bool,
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

fn errored(message: String, context: &mut Context) -> Loop {
    eprintln!("Error State: {:?}", message);

    let next_state = Errored { message };
    context.handle_state_change(&next_state);

    let effects = vec![
        Effect::CancelAllDelays,
        Effect::ProtobufSend,
    ];

    Loop::new(next_state, effects)
}

fn send_serial(effects: &mut Vec<Effect>, gcode_line: GCodeLine, context: &Context) {
    let crate::configuration::Controller {
        long_running_code_timeout,
        fast_code_timeout,
        long_running_codes,
        ..
    } = &context.controller;
    // TODO: parse gcodes in SendSerial instead of the encoder
    let gcode_macro = "G1";

    let duration = if long_running_codes.contains(&gcode_macro.to_string()) {
        long_running_code_timeout
    } else {
        fast_code_timeout
    };

    effects.push(Effect::SendSerial(gcode_line));
    effects.push(
        Effect::Delay {
            key: "tickle_delay".to_string(),
            // TODO: configurable delayFromGreetingToReady
            duration: Duration::from_millis(*duration),
            event: TickleSerialPort,
        },
    );
}

impl State {
    pub fn default_baud_rates() -> Vec<u32> {
        // baud rate candidates sorted by likelihood
        // let mut baud_rates = vec![115_200, 250_000, 230_400, 57_600, 38_400, 19_200, 9_600];
        // Test order to see if baudrate detection works
        // let mut baud_rates = vec![250000, 230400, 57600, 38400, 19200, 9600, 115200];
        let mut baud_rates = vec![115200];
        baud_rates.reverse();

        baud_rates
    }

    pub fn new_connection(baud_rate_candidates: Vec<u32>) -> Self {
        State::Connecting( Connecting { baud_rate_candidates, received_greeting: false })
    }

    fn and_no_effects(self) -> Loop {
        Loop {
            next_state: self,
            effects: vec![],
        }
    }

    fn invalid_transition_warning(self, event: &Event) -> Loop {
        eprintln!("Warning: received invalid event: {:?} in state: {:?}", event, self);

        self.and_no_effects()
    }

    fn invalid_transition_error(self, event: &Event, context: &mut Context) -> Loop {
        let message = format!("Invalid transition. State: {:?} Event: {:?}", self, event);

        errored(message, context)
    }

    pub fn consume(self, event: Event, context: &mut Context) -> Loop {
        // println!("event received {:?} in state {:?}", event, self);

        if let ProtobufClientConnection = &event {
            return Loop::new(
                self,
                vec![Effect::ProtobufSend],
            )
        }

        if let ProtobufRec( CombinatorMessage { payload } ) = &event {
            use combinator_message::*;

            match payload {
                Some(Payload::DeviceDiscovered(_)) => {
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
                        context.handle_state_change(&Disconnected);

                        Loop::new(
                            Disconnected,
                            vec![
                                Effect::CancelAllDelays,
                                Effect::CloseSerialPort,
                                Effect::ProtobufSend,
                            ],
                        )
                    }
                }
                Some(Payload::DeleteTaskHistory( DeleteTaskHistory { task_ids })) => {
                    context.delete_task_history(task_ids);
                    return self.and_no_effects()
                }
                Some(Payload::Estop(_)) => {
                    if let Ready( ReadyState { task: Some(task), .. }) = self {
                        context.push_cancel_task(&task);
                    };

                    return Loop::new(
                        State::EStopped,
                        vec![
                            Effect::CloseSerialPort,
                            Effect::CancelAllDelays,
                        ],
                    )
                }
                _ => ()
            }
        }

        if let Ready ( inner_ready_state ) = self {
            return inner_ready_state.consume(event, context)
        }

        match &event {
            Init { serial_port_available } => {
                if *serial_port_available {
                    println!("Serial Port Found");
                    self.reconnect_with_next_baud(context)
                } else {
                    println!("Disconnected");
                    self.and_no_effects()
                }
            }
            SerialPortDisconnected => {
                Loop::new(
                    Disconnected,
                    vec![Effect::CancelAllDelays],
                )
            }
            SerialPortError { message } => {
                errored(message.to_string(), context)
            }
            /* Echo, Debug and Error function the same in all states */
            SerialRec( serial_message ) => {
                match (self, serial_message) {
                    /* Errors */
                    (state @ Errored { .. }, _) => {
                        state.and_no_effects()
                    }
                    (_, Response::Error(error)) => {
                        errored(error.to_string(), context)
                    }
                    /* New socket */
                    (Connecting(conn @ Connecting { received_greeting: false, .. }), Response::Greeting) |
                    (Connecting(conn @ Connecting { received_greeting: false, .. }), Response::Ok {..}) => {
                        Self::receive_greeting(conn)
                    }
                    /* Invalid transitions */
                    (state, Response::Resend { .. }) => {
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
            GreetingTimerCompleted => {
                if let Connecting(Connecting { received_greeting: true, .. }) = self {
                    self.greeting_timer_completed(context)
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

    fn reconnect_with_next_baud(self, context: &mut Context) -> Loop {
        // let connection_timeout_ms = if let Connecting(_) = self {
        //     5_000
        // } else {
        //     1_000
        // };
        let connection_timeout_ms = 1_000;

        let mut baud_rate_candidates = match self {
            Connecting(Connecting { baud_rate_candidates, .. }) => baud_rate_candidates,
            _ => {
                let mut new_candidates = vec![context.controller.baud_rate];
                // prioritize the set baud rate in auto detection. That way we can cache the previous baud rate using
                // the baud_rate field. TODO: actually implement saving the previous baud rate
                if context.controller.automatic_baud_rate_detection {
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
            effects.append(&mut vec![
                Effect::OpenSerialPort { baud_rate },
                Effect::Delay {
                    key: "connection_timeout".to_string(),
                    duration: Duration::from_millis(connection_timeout_ms),
                    event: ConnectionTimeout,
                },
            ]);

            let next_state = Self::new_connection(baud_rate_candidates);

            context.handle_state_change(&next_state);

            Loop::new(
                next_state,
                effects,
            )
        } else {
            effects.push(Effect::CloseSerialPort);
            effects.push(Effect::ProtobufSend);

            context.handle_state_change(&Disconnected);

            Loop::new(
                Disconnected,
                effects,
            )
        }
    }

    fn connection_timeout(self, event: Event, context: &mut Context) -> Loop {
        if let Connecting(_) = self {
            self.reconnect_with_next_baud(context)
        } else {
            self.invalid_transition_error(&event, context)
        }
    }

    fn receive_greeting(mut connecting: Connecting) -> Loop {
        let delay = Effect::Delay {
            key: "greeting_delay".to_string(),
            // TODO: configurable delayFromGreetingToReady
            duration: Duration::from_millis(500),
            event: GreetingTimerCompleted,
        };

        connecting.received_greeting = true;

        Loop::new(
            State::Connecting(connecting),
            vec![delay],
        )
    }

    fn greeting_timer_completed(self, context: &mut Context) -> Loop {
        let gcode = "M110 N0".to_string();

        let mut effects = vec![
            Effect::CancelAllDelays,
        ];

        send_serial(
            &mut effects,
            GCodeLine {
                gcode: gcode.clone(),
                line_number: None,
                checksum: true,
            },
            context,
        );

        let mut ready = ReadyState::default();
        ready.last_gcode_sent = Some(gcode);

        let next_state = Ready( ready );

        context.handle_state_change(&next_state);

        // let the protobuf clients know that the machine is ready
        effects.push(Effect::ProtobufSend);

        Loop::new(
            next_state,
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
//         let event = SerialRec( Response::Greeting );
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
//         let event = SerialRec( Response::Greeting );
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
