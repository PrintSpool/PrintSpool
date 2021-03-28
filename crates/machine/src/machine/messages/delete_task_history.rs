use teg_protobufs::{
    ServerMessage,
    server_message,
};

#[xactor::message(result = "()")]
pub struct DeleteTaskHistory {
    pub task_id: crate::DbId,
}

impl From<DeleteTaskHistory> for ServerMessage {
    fn from(msg: DeleteTaskHistory) -> ServerMessage {
        ServerMessage {
            payload: Some(
                server_message::Payload::DeleteTaskHistory(
                    server_message::DeleteTaskHistory {
                        task_ids: vec![msg.task_id],
                    }
                )
            ),
        }
    }
}
