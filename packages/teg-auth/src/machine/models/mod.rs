use serde::{Deserialize, Serialize};
use versioned_sled_model::VersionedSledModel;

mod machine_r1;
pub use machine_r1::{
    Machine,
    MachineViewer,
};

mod machine_status_r1;
pub use machine_status_r1::{
    MachineStatus,
    MachineStatusGQL,
    Printing,
};

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum MachineDBEntry {
    R1 (machine_r1::Machine),
}

impl crate::models::VersionedModel for Machine {
    type Entry = MachineDBEntry;
    const NAMESPACE: &'static str = "Machine";

    fn get_id(&self) -> u64 {
        self.id
    }
}
