// Task Status Revison 1 (LATEST)
// use async_graphql::Enum;
use async_graphql::ID;
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

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct Printing {
    pub task_id: ID,
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
    pub fn is_printing_task(&self, task_id: &ID) -> bool {
      if let MachineStatus::Printing(printing) = self {
        &printing.task_id == task_id
      } else {
        false
      }
    }

    pub fn can_start_task(&self, task: &Task) -> bool {
        match self {
            Self::Ready | Self::Printing(_) if task.machine_override => true,
            Self::Printing(_) if self.is_printing_task(&task.id) => true,
            Self::Ready => true,
            _ => false
        }
    }
}
