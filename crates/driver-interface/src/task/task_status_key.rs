use std::borrow::Cow;

use super::TaskStatus;
use bonsaidb::core::key::{Key, KeyEncoding};
use int_enum::IntEnum;
use serde::{Deserialize, Serialize};
use tracing::warn;

#[repr(u8)]
#[derive(
    Clone,
    Copy,
    Debug,
    PartialEq,
    Eq,
    PartialOrd,
    Ord,
    Hash,
    IntEnum,
    async_graphql::Enum,
    Serialize,
    Deserialize,
)]
#[graphql(name = "TaskStatus")]
pub enum TaskStatusKey {
    /* Before sending to the driver */
    /// The task is enqueued. It will begin printing as soon as the tasks spooled before it finish.
    #[graphql(name = "SPOOLED")]
    Spooled = 10,

    /* After sending to the driver */
    /// The task is in the process of being printed.
    #[graphql(name = "STARTED")]
    Started = 20,
    /// The task completed its print successfully
    #[graphql(name = "FINISHED")]
    Finished = 30,
    /// The task was paused by the user
    #[graphql(name = "PAUSED")]
    Paused = 40,
    /// The task was halted pre-emptively by the user.
    #[graphql(name = "CANCELLED")]
    Cancelled = 50,
    /// An error occurred during the print.
    #[graphql(name = "ERRORED")]
    Errored = 60,
}

impl TaskStatusKey {
    pub const PENDING: &'static [Self] = &[Self::Spooled, Self::Started, Self::Paused];

    pub const SETTLED: &'static [Self] = &[Self::Finished, Self::Cancelled, Self::Errored];

    // pub static ALL: &'static [Self] =
    //     constcat::concat_slices!([TaskStatusKey]: TaskStatusKey::PENDING);

    pub const ABORTED: &'static [Self] = &[Self::Cancelled, Self::Errored];

    pub fn all() -> Vec<Self> {
        [TaskStatusKey::PENDING, TaskStatusKey::SETTLED].concat()
    }
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

impl<'k> Key<'k> for TaskStatusKey {
    fn from_ord_bytes(bytes: &'k [u8]) -> Result<Self, Self::Error> {
        let byte = u8::from_ord_bytes(bytes)?;

        TaskStatusKey::from_int(byte).map_err(|err| {
            // This error type does not properly convey the reason for the error so a warning is added as a workaround for now.
            // Ideally a error type would be defined for TaskStatusKey en/decoding.
            warn!("TaskStatusKey had invalid serialization: {:?}", err);
            bonsaidb::core::key::IncorrectByteLength
        })
    }
}

impl<'k> KeyEncoding<'k, Self> for TaskStatusKey {
    type Error = <u8 as KeyEncoding<'k, u8>>::Error;

    const LENGTH: Option<usize> = Some(1);

    fn as_ord_bytes(&'k self) -> Result<Cow<'k, [u8]>, Self::Error> {
        let val = *self as u8;
        Ok(Cow::from(val.to_be_bytes().to_vec()))
    }
}
