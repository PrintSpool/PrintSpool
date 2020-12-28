use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

#[xactor::message(result = "()")]
pub struct DeleteTaskHistory {
    task_id: crate::DbId,
}

impl From<DeleteTaskHistory> for CombinatorMessage {
    fn from(msg: DeleteTaskHistory) -> CombinatorMessage {
        CombinatorMessage {
            payload: Some(
                combinator_message::Payload::DeleteTaskHistory(
                    combinator_message::DeleteTaskHistory {
                        task_ids: vec![msg.task_id],
                    }
                )
            ),
        }
    }
}
