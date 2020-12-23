use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

pub fn delete_task_history(task_id: crate::DbId) -> CombinatorMessage {
    CombinatorMessage {
        payload: Some(
            combinator_message::Payload::DeleteTaskHistory(
                combinator_message::DeleteTaskHistory {
                    task_ids: vec![task_id as u32],
                }
            )
        ),
    }
}
