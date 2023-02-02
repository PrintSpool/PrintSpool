use serde::{Deserialize, Serialize};

use super::TaskStatus;

#[derive(async_graphql::Enum, Debug, Serialize, Deserialize, Copy, Clone, PartialEq, Eq)]
#[graphql(name = "TaskStatus")]
pub enum TaskStatusKey {
    /* Before sending to the driver */
    /// The task is enqueued. It will begin printing as soon as the tasks spooled before it finish.
    #[graphql(name = "SPOOLED")]
    Spooled,

    /* After sending to the driver */
    /// The task is in the process of being printed.
    #[graphql(name = "STARTED")]
    Started,
    /// The task completed its print successfully
    #[graphql(name = "FINISHED")]
    Finished,
    /// The task was paused by the user
    #[graphql(name = "PAUSED")]
    Paused,
    /// The task was halted pre-emptively by the user.
    #[graphql(name = "CANCELLED")]
    Cancelled,
    /// An error occurred during the print.
    #[graphql(name = "ERRORED")]
    Errored,
}

impl TaskStatusKey {
    pub const PENDING: &'static [Self] = &[
        TaskStatusKey::Spooled,
        TaskStatusKey::Started,
        TaskStatusKey::Paused,
    ];

    pub const SETTLED: &'static [Self] = &[
        TaskStatusKey::Finished,
        TaskStatusKey::Cancelled,
        TaskStatusKey::Errored,
    ];

    pub const ALL: &'static [Self] = &[..Self::PENDING, ..Self::SETTLED];

    pub const ABORTED: &'static [Self] = &[TaskStatusKey::Cancelled, TaskStatusKey::Errored];
}

impl From<&TaskStatus> for TaskStatusKey {
    fn from(status: &TaskStatus) -> Self {
        match status {
            TaskStatus::Created(_) => Self::Spooled,
            TaskStatus::Started => Self::Started,
            TaskStatus::Finished(_) => Self::Finished,
            TaskStatus::Paused(_) => Self::Paused,
            TaskStatus::Cancelled(_) => Self::Cancelled,
            TaskStatus::Errored(_) => Self::Errored,
        }
    }
}
