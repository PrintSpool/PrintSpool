// Task Status Revison 1 (LATEST)
use std::convert::TryFrom;
use serde::{Deserialize, Serialize};
use teg_protobufs::machine_message::TaskProgress;

use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

use crate::machine::models::Errored;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum TaskStatus {
    /* Before sending to the driver */

    /// The task is enqueued. It will begin printing as soon as the tasks spooled before it finish.
    Spooled,

    /* After sending to the driver */

    /// The task is in the process of being printed.
    Started,
    /// The task completed its print successfully
    Finished,
    /// The task was paused by the user
    Paused,
    /// The task was halted pre-emptively by the user.
    Cancelled,
    /// An error occurred durring the print.
    Errored(Errored),
}

#[derive(async_graphql::Enum, Debug, Serialize, Deserialize, Copy, Clone, PartialEq, Eq)]
pub enum TaskStatusGQL {
    /* Before sending to the driver */

    /// The task is enqueued. It will begin printing as soon as the tasks spooled before it finish.
    #[graphql(name = "SPOOLED_TASK")]
    Spooled,

    /* After sending to the driver */

    /// The task is in the process of being printed.
    #[graphql(name = "START_TASK")]
    Started,
    /// The task completed its print successfully
    #[graphql(name = "FINISH_TASK")]
    Finished,
    /// The task was paused by the user
    #[graphql(name = "PAUSE_TASK")]
    Paused,
    /// The task was halted pre-emptively by the user.
    #[graphql(name = "CANCELLED")]
    Cancelled,
    /// An error occurred durring the print.
    #[graphql(name = "ERROR")]
    Errored,
}

impl From<TaskStatus> for TaskStatusGQL {
    fn from(status: TaskStatus) -> Self {
        match status {
          TaskStatus::Spooled => TaskStatusGQL::Spooled,
          TaskStatus::Started => TaskStatusGQL::Started,
          TaskStatus::Finished => TaskStatusGQL::Finished,
          TaskStatus::Paused => TaskStatusGQL::Paused,
          TaskStatus::Cancelled => TaskStatusGQL::Cancelled,
          TaskStatus::Errored(_) => TaskStatusGQL::Errored,
        }
    }
}

impl Default for TaskStatus {
    fn default() -> Self { TaskStatus::Spooled }
}

impl TaskStatus {
    pub fn from_task_progress(
        progress: &TaskProgress,
        error: &Option<teg_protobufs::machine_message::Error>,
    ) -> Result<Self> {
        use teg_protobufs::machine_message::TaskStatus as TS;

        let status = match progress.status {
            i if i == TS::TaskStarted as i32 => TaskStatus::Started,
            i if i == TS::TaskFinished as i32 => TaskStatus::Finished,
            i if i == TS::TaskPaused as i32 => TaskStatus::Paused,
            i if i == TS::TaskCancelled as i32 => TaskStatus::Cancelled,
            i if i == TS::TaskErrored as i32 => {
                let message = error
                    .map(|e| e.message.clone())
                    .unwrap_or_else(|| "Error message not found".to_string());

                TaskStatus::Errored(Errored { message })
            },
            i => Err(anyhow!("Invalid task status: {}", i))?,
        };

        Ok(status)
    }

    pub fn is_paused(&self) -> bool {
        *self == Self::Paused
    }

    pub fn is_pending(&self) -> bool {
        !self.is_settled()
    }

    pub fn is_settled(&self) -> bool {
        match self {
            | TaskStatus::Finished
            | TaskStatus::Cancelled
            | TaskStatus::Errored(_)
            => true,
            _ => false,
          }
    }

    pub fn was_successful(&self) -> bool {
        self == &Self::Finished
    }

    pub fn was_aborted(&self) -> bool {
        match self {
            | TaskStatus::Cancelled
            | TaskStatus::Errored(_)
            => true,
            _ => false,
          }
    }
}
