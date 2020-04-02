use super::{
    State,
    Loop,
    State::*,
    Effect,
    Context,
    cancel_task,
};

pub fn disconnect(state: &State, context: &mut Context) -> Loop {
    info!("Disconnected");

    cancel_task(state, context);

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
