// Task Status Revison 1 (LATEST)
use async_graphql::Enum;
use serde::{Deserialize, Serialize};
use crate::print_queue::tasks::Task;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum MachineStatus {
    Disconnected,
    Connecting,
    Ready,
    Printing(Printing),
    Errored,
    Stopped,
}

#[Enum]
pub enum MachineStatusGQL {
    Disconnected,
    Connecting,
    Ready,
    Printing,
    Errored,
    #[item(name = "ESTOPPED")]
    Stopped,
}

impl From<MachineStatus> for MachineStatusGQL {
    fn from(status: MachineStatus) -> Self {
        match status {
          MachineStatus::Disconnected => MachineStatusGQL::Disconnected,
          MachineStatus::Connecting => MachineStatusGQL::Connecting,
          MachineStatus::Ready => MachineStatusGQL::Ready,
          MachineStatus::Printing(_) => MachineStatusGQL::Printing,
          MachineStatus::Errored => MachineStatusGQL::Errored,
          MachineStatus::Stopped => MachineStatusGQL::Stopped,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Printing {
    pub task_id: u64,
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

    pub fn is_printing_task(&self, task_id: u64) -> bool {
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

    pub fn can_start_task(&self, task: &Task, automatic_print: bool) -> bool {
        match self {
            Self::Printing(_) if task.machine_override || automatic_print => true,
            Self::Ready => true,
            _ => false
        }
    }
}
