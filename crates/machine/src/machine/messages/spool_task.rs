use xactor::*;
use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
};

use crate::task::{
    Task,
    TaskContent,
};

// use crate::machine::Machine;

#[message(result = "()")]
pub struct SpoolTask {
    client_id: crate::DbId,
    task: Task,
}

impl From<SpoolTask> for CombinatorMessage {
    fn from(msg: SpoolTask) -> CombinatorMessage {
        let SpoolTask {
            client_id,
            task
        } = msg;

        let content = match &task.content {
            TaskContent::FilePath(file_path) => {
                combinator_message::spool_task::Content::FilePath(file_path.clone())
            }
            TaskContent::GCodes(gcodes) => {
                combinator_message::spool_task::Content::Inline(
                    combinator_message::InlineContent {
                        commands: gcodes.clone(),
                    },
                )
            }
        };

        let start_at_line_number = task.despooled_line_number
            .map(|n| n + 1)
            .unwrap_or(0);

        let message = CombinatorMessage {
            payload: Some(
                combinator_message::Payload::SpoolTask(
                    combinator_message::SpoolTask {
                        task_id: task.id,
                        client_id,
                        start_at_line_number,
                        machine_override: task.machine_override,
                        content: Some(content),
                    }
                )
            ),
        };

        message
    }
}

// #[async_trait::async_trait]
// impl Handler<SpoolTask> for Machine {
//     async fn handle(&mut self, _ctx: &mut Context<Self>, msg: SpoolTask) -> () {
//         self.send_message(msg.into())
//     }
// }
