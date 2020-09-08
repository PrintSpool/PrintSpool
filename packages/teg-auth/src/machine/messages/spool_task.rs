use anyhow::{
    // anyhow,
    Result,
    // Context as _,
};

use teg_protobufs::{
    CombinatorMessage,
    combinator_message,
    // MachineMessage,
    // machine_message,
};

use crate::print_queue::tasks::{
    Task,
    TaskContent,
};

pub fn spool_task(client_id: u32, task: &Task) -> Result<CombinatorMessage> {
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
                    task_id: task.id as u32,
                    client_id,
                    start_at_line_number,
                    machine_override: task.machine_override,
                    content: Some(content),
                }
            )
        ),
    };

    Ok(message)
}
