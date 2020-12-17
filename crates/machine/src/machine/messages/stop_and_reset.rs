use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

pub fn stop_machine() -> CombinatorMessage {
    CombinatorMessage {
        payload: Some(
            combinator_message::Payload::Estop(
                combinator_message::EStop {}
            )
        ),
    }
}

pub fn reset_machine() -> CombinatorMessage {
    CombinatorMessage {
        payload: Some(
            combinator_message::Payload::Reset(
                combinator_message::Reset {}
            )
        ),
    }
}

pub fn reset_when_idle() -> CombinatorMessage {
    CombinatorMessage {
        payload: Some(
            combinator_message::Payload::ResetWhenIdle(
                combinator_message::Reset {}
            )
        ),
    }
}
