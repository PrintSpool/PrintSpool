use chrono::prelude::*;
use eyre::eyre;
use eyre::Result;
use printspool_protobufs::machine_message::TaskProgress;
use serde::{Deserialize, Serialize};

pub use crate::machine::status::Errored;

use super::TaskStatusKey;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum TaskStatus {
    /* Before sending to the driver */
    /// The task may be enqueued or pre-processing it's gcode. It will begin printing as soon as
    /// pre-processing is completed and the tasks before it in the driver finish.
    Created(Created),

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

#[derive(Clone, Debug, Serialize, Deserialize, Default)]
pub struct Created {
    /// Set once the server sends the tasks to the driver
    pub sent_to_driver: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Finished {
    pub finished_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Paused {
    pub paused_at: DateTime<Utc>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Cancelled {
    pub cancelled_at: DateTime<Utc>,
}

impl Default for TaskStatus {
    fn default() -> Self {
        TaskStatus::Created(Default::default())
    }
}

impl TaskStatus {
    pub fn from_task_progress(
        progress: &TaskProgress,
        error: &Option<printspool_protobufs::machine_message::Error>,
    ) -> Result<Self> {
        use printspool_protobufs::machine_message::TaskStatus as TS;

        let status = match progress.status {
            i if i == TS::TaskStarted as i32 => TaskStatus::Started,
            i if i == TS::TaskFinished as i32 => TaskStatus::Finished(Finished {
                finished_at: Utc::now(),
            }),
            i if i == TS::TaskPaused as i32 => TaskStatus::Paused(Paused {
                paused_at: Utc::now(),
            }),
            i if i == TS::TaskCancelled as i32 => TaskStatus::Cancelled(Cancelled {
                cancelled_at: Utc::now(),
            }),
            i if i == TS::TaskErrored as i32 => {
                let message = error
                    .as_ref()
                    .map(|e| e.message.clone())
                    .unwrap_or_else(|| "Error message not found".to_string());

                TaskStatus::Errored(Errored {
                    message,
                    errored_at: Utc::now(),
                })
            }
            i => Err(eyre!("Invalid task status: {}", i))?,
        };

        Ok(status)
    }

    pub fn is_paused(&self) -> bool {
        matches!(self, TaskStatus::Paused(_))
    }

    pub fn is_pending(&self) -> bool {
        TaskStatusKey::PENDING.contains(self.into())
    }

    pub fn is_settled(&self) -> bool {
        TaskStatusKey::SETTLED.contains(self.into())
    }

    pub fn was_successful(&self) -> bool {
        matches!(self, TaskStatus::Finished(_))
    }

    pub fn was_aborted(&self) -> bool {
        TaskStatusKey::ABORTED.contains(self.into())
    }
}
