use super::{
    Loop,
    State::*,
    Effect,
    Context,
};

pub fn disconnect(context: &mut Context) -> Loop {
    eprintln!("Disconnected");

    let effects = vec![
        Effect::CancelAllDelays,
        Effect::CloseSerialPort,
        Effect::ProtobufSend,
        // TODO: try to re-open the serial port immediately in case a new port is already available
        // Effect::DetectSerialPort,
    ];

    context.handle_state_change(&Disconnected);

    Loop::new(
        Disconnected,
        effects,
    )
}
