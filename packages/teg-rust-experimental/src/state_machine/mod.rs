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
    Init,
    ConnectionTimeout,
    GreetingTimerCompleted,
    SerialRec ( Response ),
    ProtobufRec ( CombinatorMessage ),
    PollFeedback,
    TickleSerialPort,
    SerialPortDisconnected,
    SerialPortError{ message: String },
    GCodeLoaded(Task),
    GCodeLoadFailed( combinator_message::SpoolTask ),
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
    let next_state = Errored { message };
    context.handle_state_change(&next_state);

    let effects = vec![
        Effect::CancelAllDelays,
        Effect::ProtobufSend,
    ];

    Loop::new(next_state, effects)
}

fn send_serial(effects: &mut Vec<Effect>, gcode_line: GCodeLine) {
    // TODO: configurable tickle delays
    // const {
    //     longRunningCodeTimeout,
    //     fastCodeTimeout,
    //     longRunningCodes,
    // } = state.config
    let long_running_code_timeout = 30_000;
    let fast_code_timeout = 5000;
    let long_running_codes: [String; 0] = [];
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
            duration: Duration::from_millis(duration),
            event: TickleSerialPort,
        },
    );
}

impl State {
    pub fn default_baud_rates() -> Vec<u32> {
        // baud rate candidates sorted by likelihood
        let mut baud_rates = vec![115200, 250000, 230400, 57600, 38400, 19200, 9600];
        // Test order to see if baudrate detection works
        // let mut baud_rates = vec![250000, 230400, 57600, 38400, 19200, 9600, 115200];
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
        println!("event received {:?} in state {:?}", event, self);
        if let Ready ( inner_ready_state ) = self {
            return inner_ready_state.consume(event, context)
        }
        match &event {
            Init => {
                self.connect_if_disconnected()
            }
            ProtobufRec( CombinatorMessage { payload } ) => {
                if let Some(combinator_message::Payload::DeviceDiscovered(_)) = payload {
                    self.connect_if_disconnected()
                } else {
                    println!("PROTOBUF RECEIVED IN STATE_MACHINE {:?}", payload);
                    self.and_no_effects()
                }
            }
            SerialPortDisconnected => {
                Disconnected.and_no_effects()
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
                    self.greeting_timer_completed()
                } else {
                    self.invalid_transition_error(&event, context)
                }
            },
            /* Warnings */
            PollFeedback |
            TickleSerialPort |
            GCodeLoaded(..) |
            GCodeLoadFailed(..) => {
                self.invalid_transition_warning(&event)
            }
            /* Errors */
            // _ => self.invalid_transition_error(&event)
        }
    }

    fn connect_if_disconnected(self) -> Loop {
        // Due to the async nature of discovery the new port could be discovered before disconnecting from the old one.
        // The state machine will automatically attempt to reconnect on disconnect to handle this edge case.
        if let Disconnected = self {
            let mut baud_rate_candidates = Self::default_baud_rates();
            let effects = vec![
                Effect::TryOpenSerialPort { baud_rate: baud_rate_candidates.pop().unwrap() },
                Effect::Delay {
                    key: "connection_timeout".to_string(),
                    duration: Duration::from_millis(1000),
                    event: ConnectionTimeout,
                },
            ];

            Loop::new(
                Self::new_connection(baud_rate_candidates),
                effects,
            )
        } else {
            self.and_no_effects()
        }
    }

    fn connection_timeout(self, event: Event, context: &mut Context) -> Loop {
        if let Connecting(Connecting { mut baud_rate_candidates, .. }) = self {
            let mut effects = vec![
                Effect::CancelAllDelays,
            ];

            if let Some(baud_rate) = baud_rate_candidates.pop() {
                effects.push(Effect::TryOpenSerialPort { baud_rate });

                Loop::new(
                    Self::new_connection(baud_rate_candidates),
                    effects,
                )
            } else {
                Loop::new(
                    Disconnected,
                    effects,
                )
            }
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

    fn greeting_timer_completed(self) -> Loop {
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
            }
        );

        let mut ready = ReadyState::default();
        ready.last_gcode_sent = Some(gcode);

        // let the protobuf clients know that the machine is ready
        effects.push(Effect::ProtobufSend);

        Loop::new(
            Ready( ready ),
            effects,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn runs_the_greeting_handshake() {
        let state = State::new_connection(State::default_baud_rates());
        let event = SerialRec( Response::Greeting );
        let mut context = Context::new();

        let Loop { next_state, effects } = state.consume(event, &mut context);

        if let [Effect::Delay { event: GreetingTimerCompleted, .. }] = effects[..] {
        } else {
            panic!("Expected Delay, got: {:?}", effects)
        };

        if let Connecting(Connecting { received_greeting: true, .. }) = next_state {
        } else {
            panic!("Expected Delay, got: {:?}", next_state)
        };
    }

    #[test]
    fn ignores_multiple_greetings() {
        let state = State::Connecting(Connecting {
            baud_rate_candidates: State::default_baud_rates(),
            received_greeting: true,
        });
        let event = SerialRec( Response::Greeting );
        let mut context = Context::new();

        let Loop { next_state:_, effects } = state.clone().consume(event, &mut context);

        assert!(effects.is_empty());
        // TODO: equality checks
        // assert_eq!(state, next_state);
    }

    #[test]
    fn starts_the_printer_after_the_greeting_timer() {
        let state = State::Connecting(Connecting {
            baud_rate_candidates: State::default_baud_rates(),
            received_greeting: true,
        });
        let event = GreetingTimerCompleted;
        let mut context = Context::new();

        let Loop { next_state, effects } = state.consume(event, &mut context);

        match &effects[..] {
            [Effect::SendSerial (GCodeLine { gcode, .. }), Effect::Delay {..}] if gcode[..] == *"M110 N0" => {}
            _ => panic!("Expected SendSerial {{ gcode: \"M110 N0\" }}, got: {:?}", effects)
        }

        if let Ready { .. } = next_state {
        } else {
            panic!("Expected Ready, got: {:?}", next_state)
        };
    }

}
