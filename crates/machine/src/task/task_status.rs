use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use anyhow::{
    anyhow,
    Result,
    // Context as _,
};
use teg_protobufs::machine_message::TaskProgress;

pub use crate::machine::Errored;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum TaskStatus {
    /* Before sending to the driver */

    /// The task is enqueued. It will begin printing as soon as the tasks spooled before it finish.
    Spooled,

    /* After sending to the driver */

    /// The task is in the process of being printed.
    Started,
    /// The task completed its print successfully
    Finished(Finished),
    /// The task was paused by the user
    Paused(Paused),
    /// The task was halted pre-emptively by the user.
    Cancelled(Cancelled),
    /// An error occurred during the print.
    ///
    /// Re-uses the MachineStatus::Errored type for easier cloning of the MachineStatus into the
    /// TaskStatus.
    Errored(Errored),
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Finished {
    pub finished_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Paused {
    pub paused_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Cancelled {
    pub cancelled_at: DateTime<Utc>,
}

#[derive(async_graphql::Enum, Debug, Serialize, Deserialize, Copy, Clone, PartialEq, Eq)]
#[graphql(name = "TaskStatus")]
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
    /// An error occurred during the print.
    #[graphql(name = "ERROR")]
    Errored,
}

impl From<&TaskStatus> for TaskStatusGQL {
    fn from(status: &TaskStatus) -> Self {
        match status {
          TaskStatus::Spooled => TaskStatusGQL::Spooled,
          TaskStatus::Started => TaskStatusGQL::Started,
          TaskStatus::Finished(_) => TaskStatusGQL::Finished,
          TaskStatus::Paused(_) => TaskStatusGQL::Paused,
          TaskStatus::Cancelled(_) => TaskStatusGQL::Cancelled,
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
            i if i == TS::TaskFinished as i32 => {
                TaskStatus::Finished(Finished {
                    finished_at: Utc::now(),
                })
            }
            i if i == TS::TaskPaused as i32 => {
                TaskStatus::Paused(Paused {
                    paused_at: Utc::now(),
                })
            }
            i if i == TS::TaskCancelled as i32 => {
                TaskStatus::Cancelled(Cancelled {
                    cancelled_at: Utc::now(),
                })
            }
            i if i == TS::TaskErrored as i32 => {
                let message = error
                    .as_ref()
                    .map(|e| e.message.clone())
                    .unwrap_or_else(|| "Error message not found".to_string());

                TaskStatus::Errored(Errored {
                    message,
                    errored_at: Utc::now(),
                })
            },
            i => Err(anyhow!("Invalid task status: {}", i))?,
        };

        Ok(status)
    }

    pub fn to_db_str(&self) -> &'static str {
        use TaskStatus::*;
        match self {
            Spooled => "spooled",
            Started => "started",
            Finished(_) => "finished",
            Paused(_) =>"paused",
            Cancelled(_) => "cancelled",
            Errored(_) => "errored",
        }
    }

    pub fn is_paused(&self) -> bool {
        match self {
            TaskStatus::Paused(_) => true,
            _ => false,
          }
    }

    pub fn is_pending(&self) -> bool {
        !self.is_settled()
    }

    pub fn is_settled(&self) -> bool {
        match self {
            | TaskStatus::Finished(_)
            | TaskStatus::Cancelled(_)
            | TaskStatus::Errored(_)
            => true,
            _ => false,
          }
    }

    pub fn was_successful(&self) -> bool {
        match self {
            TaskStatus::Finished(_) => true,
            _ => false,
          }
    }

    pub fn was_aborted(&self) -> bool {
        match self {
            | TaskStatus::Cancelled(_)
            | TaskStatus::Errored(_)
            => true,
            _ => false,
          }
    }
}
