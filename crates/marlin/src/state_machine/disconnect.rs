use super::{
    State,
    Loop,
    State::*,
    Effect,
    Context,
    ReadyState,
};

pub fn disconnect(state: &State, context: &mut Context) -> Loop {
    info!("Disconnected");

    if let Ready( ReadyState { tasks, .. }) = state {
        tasks
            .iter()
            .for_each(|task| {
                context.push_error(&task);
            });
    };

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
