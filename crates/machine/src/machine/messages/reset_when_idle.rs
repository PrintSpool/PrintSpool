use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

#[xactor::message(result = "()")]
pub struct ResetWhenIdle();

impl From<ResetWhenIdle> for CombinatorMessage {
    fn from(_msg: ResetWhenIdle) -> CombinatorMessage {
        CombinatorMessage {
            payload: Some(
                combinator_message::Payload::ResetWhenIdle(
                    combinator_message::Reset {}
                )
            ),
        }
    }
}
