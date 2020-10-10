// Task Status Revison 1 (LATEST)
use std::convert::TryFrom;
use async_graphql::*;
use serde::{Deserialize, Serialize};
use teg_protobufs::machine_message::TaskProgress;

use anyhow::{
    anyhow,
    Result,
    // Context as _,
};

#[Enum]
#[derive(Debug, Serialize, Deserialize)]
pub enum TaskStatus {
    /* Before sending to the driver */

    /// The task is enqueued. It will begin printing as soon as the tasks spooled before it finish.
    #[item(name = "SPOOLED_TASK")]
    Spooled,

    /* After sending to the driver */

    /// The task is in the process of being printed.
    #[item(name = "START_TASK")]
    Started,
    /// The task completed its print successfully
    #[item(name = "FINISH_TASK")]
    Finished,
    /// The task was paused by the user
    #[item(name = "PAUSE_TASK")]
    Paused,
    /// The task was halted pre-emptively by the user.
    #[item(name = "CANCELLED")]
    Cancelled,
    /// An error occurred durring the print.
    #[item(name = "ERROR")]
    Errored,
}

impl Default for TaskStatus {
    fn default() -> Self { TaskStatus::Spooled }
}

impl TaskStatus {
    pub fn is_paused(&self) -> bool {
        *self == Self::Paused
    }

    pub fn is_pending(&self) -> bool {
        !self.is_settled()
    }

    pub fn is_settled(&self) -> bool {
        [
            Self::Cancelled,
            Self::Errored,
            Self::Finished,
        ].contains(self)
    }

    pub fn was_successful(&self) -> bool {
        self == &Self::Finished
    }

    pub fn was_aborted(&self) -> bool {
        [
            Self::Cancelled,
            Self::Errored,
        ].contains(self)
    }
}

impl TryFrom<&TaskProgress> for TaskStatus {
    type Error = anyhow::Error;

    fn try_from(progress: &TaskProgress) -> Result<TaskStatus> {
        use teg_protobufs::machine_message::TaskStatus as TS;

        let status = match progress.status {
            i if i == TS::TaskStarted as i32 => TaskStatus::Started,
            i if i == TS::TaskFinished as i32 => TaskStatus::Finished,
            i if i == TS::TaskPaused as i32 => TaskStatus::Paused,
            i if i == TS::TaskCancelled as i32 => TaskStatus::Cancelled,
            i if i == TS::TaskErrored as i32 => TaskStatus::Errored,
            i => Err(anyhow!("Invalid task status: {}", i))?,
        };

        Ok(status)
    }
}

// export const indexedTaskStatuses = [
//   CANCELLED, // 0
//   PAUSE_TASK, // 1
//   ERROR, // 2
//   START_TASK, // 3
//   FINISH_TASK, // 4
// ]

// export const taskFailureStatuses = [
//   CANCELLED,
//   ERROR,
// ]

// export const endedTaskStatuses = [
//   CANCELLED,
//   ERROR,
//   FINISH_TASK,
// ]

// export const spooledTaskStatuses = [
//   PAUSE_TASK,
//   START_TASK,
//   SPOOLED_TASK,
// ]

// export const busyMachineTaskStatuses = [
//   PAUSE_TASK,
//   START_TASK,
// ]
