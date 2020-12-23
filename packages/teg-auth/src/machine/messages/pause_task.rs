use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

pub fn pause_task(task_id: crate::DbId) -> CombinatorMessage {
    CombinatorMessage {
        payload: Some(
            combinator_message::Payload::PauseTask(
                combinator_message::PauseTask { task_id: task_id as u32 }
            )
        ),
    }
}
