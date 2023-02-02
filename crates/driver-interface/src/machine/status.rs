use super::Machine;
use crate::{task::Task, DbId};
use chrono::prelude::*;
use eyre::{
    eyre,
    Result,
    // Context as _,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq)]
pub enum MachineStatus {
    Disconnected,
    Connecting,
    Ready,
    Printing(Printing),
    Errored(Errored),
    Stopped,
}

#[derive(async_graphql::Enum, Debug, Copy, Clone, Eq, PartialEq)]
#[graphql(name = "MachineStatus")]
pub enum MachineStatusGQL {
    /// The machine is disconnected or turned off.
    Disconnected,
    /// The machine is being initialized.
    Connecting,
    /// The machine is connected and able to exececute gcodes and start prints.
    Ready,
    /// The machine is printing a part.
    Printing,
    /// The machine has been paused mid-print.
    Paused,
    /// The machine has encountered an error and automatically stopped the print. Send a reset
    /// mutation to change the status to \`CONNECTING\`.
    Errored,
    /// The machine was stopped by the user. Send a reset mutation to change the status to
    /// \`CONNECTING\`.
    Stopped,
}

impl From<MachineStatus> for MachineStatusGQL {
    fn from(status: MachineStatus) -> Self {
        match status {
            MachineStatus::Disconnected => MachineStatusGQL::Disconnected,
            MachineStatus::Connecting => MachineStatusGQL::Connecting,
            MachineStatus::Ready => MachineStatusGQL::Ready,
            MachineStatus::Printing(Printing { paused: false, .. }) => MachineStatusGQL::Printing,
            MachineStatus::Printing(Printing { paused: true, .. }) => MachineStatusGQL::Paused,
            MachineStatus::Errored(_) => MachineStatusGQL::Errored,
            MachineStatus::Stopped => MachineStatusGQL::Stopped,
        }
    }
}

#[derive(Clone, Debug)]
pub struct Printing {
    pub task_id: DbId<Task>,
    pub paused: bool,
    /// The state of the machine at the time the print was paused
    pub paused_state: Option<Box<Machine>>,
}

impl PartialEq for Printing {
    fn eq(&self, other: &Self) -> bool {
        self.task_id == other.task_id
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Errored {
    pub errored_at: DateTime<Utc>,
    pub message: String,
}

impl Default for MachineStatus {
    fn default() -> Self {
        MachineStatus::Disconnected
    }
}

// impl MachineStatus {
//     pub fn was_successful(&self) -> bool {
//         self == &Self::Finished
//     }

//     pub fn was_aborted(&self) -> bool {
//         [
//             Self::Cancelled,
//             Self::Errored,
//         ].contains(self)
//     }
// }

impl MachineStatus {
    pub fn is_driver_ready(&self) -> bool {
        match self {
            Self::Ready | Self::Printing(_) => true,
            _ => false,
        }
    }

    pub fn is_printing_task(&self, task_id: &DbId<Task>) -> bool {
        if let MachineStatus::Printing(printing) = self {
            &printing.task_id == task_id
        } else {
            false
        }
    }

    pub fn is_printing(&self) -> bool {
        if let MachineStatus::Printing(_) = self {
            true
        } else {
            false
        }
    }

    pub fn is_paused(&self) -> bool {
        if let MachineStatus::Printing(Printing { paused: true, .. }) = self {
            true
        } else {
            false
        }
    }

    pub fn is_stopped(&self) -> bool {
        self == &MachineStatus::Stopped
    }

    pub fn can_start_task(&self, task: &Task, is_automatic_print: bool) -> bool {
        match self {
            Self::Printing(_) if is_automatic_print || task.machine_override => true,
            // Allow paused tasks to be resumed and be pre-empted by manual controls
            Self::Printing(Printing {
                paused: true,
                task_id,
                ..
            }) => !task.is_print() || &task.id == task_id,
            Self::Ready => true,
            _ => false,
        }
    }

    pub fn verify_can_start(&self, task: &Task, is_automatic_print: bool) -> Result<()> {
        if !self.can_start_task(&task, is_automatic_print) {
            Err(eyre!("Cannot start task while machine is: {:?}", self))?;
        };
        Ok(())
    }
}
