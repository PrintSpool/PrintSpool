// Task Status Revison 1 (LATEST)
use serde::{Deserialize, Serialize};
use crate::task::AnyTask;

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
pub enum MachineStatusGQL {
    Disconnected,
    Connecting,
    Ready,
    Printing,
    Errored,
    #[graphql(name = "ESTOPPED")]
    Stopped,
}

impl From<MachineStatus> for MachineStatusGQL {
    fn from(status: MachineStatus) -> Self {
        match status {
          MachineStatus::Disconnected => MachineStatusGQL::Disconnected,
          MachineStatus::Connecting => MachineStatusGQL::Connecting,
          MachineStatus::Ready => MachineStatusGQL::Ready,
          MachineStatus::Printing(_) => MachineStatusGQL::Printing,
          MachineStatus::Errored(_) => MachineStatusGQL::Errored,
          MachineStatus::Stopped => MachineStatusGQL::Stopped,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Printing {
    pub task_id: crate::DbId,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct Errored {
    pub message: String,
}

impl Default for MachineStatus {
    fn default() -> Self { MachineStatus::Disconnected }
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
        _ => false
      }
    }

    pub fn is_printing_task(&self, task_id: crate::DbId) -> bool {
      if let MachineStatus::Printing(printing) = self {
        printing.task_id == task_id
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

    pub fn can_start_task(&self, task: &AnyTask, is_automatic_print: bool) -> bool {
        match self {
            Self::Printing(_) if is_automatic_print || task.machine_override() => {
              true
            }
            Self::Ready => {
              true
            }
            _ => false
        }
    }
}
