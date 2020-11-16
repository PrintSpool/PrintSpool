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
    Errored,
};

mod heater_r1;
pub use heater_r1::{
    Heater,
    TemperatureHistoryEntry,
};

mod axis_r1;
pub use axis_r1::Axis;

mod ephemeral_machine_data;
pub use ephemeral_machine_data::EphemeralMachineData;

mod gcode_history_entry;
pub use gcode_history_entry::{
    GCodeHistoryEntry,
    GCodeHistoryDirection,
};

mod speed_controller_r1;
pub use speed_controller_r1::SpeedController;

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

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum HeaterDBEntry {
    R1 (heater_r1::Heater),
}

impl crate::models::VersionedModel for Heater {
    type Entry = HeaterDBEntry;
    const NAMESPACE: &'static str = "Heater";

    fn get_id(&self) -> u64 {
        self.id
    }
}

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum AxisDBEntry {
    R1 (axis_r1::Axis),
}

impl crate::models::VersionedModel for Axis {
    type Entry = AxisDBEntry;
    const NAMESPACE: &'static str = "Axis";

    fn get_id(&self) -> u64 {
        self.id
    }
}

#[derive(Debug, Serialize, Deserialize, VersionedSledModel)]
pub enum SpeedControllerDBEntry {
    R1 (speed_controller_r1::SpeedController),
}

impl crate::models::VersionedModel for SpeedController {
    type Entry = SpeedControllerDBEntry;
    const NAMESPACE: &'static str = "SpeedController";

    fn get_id(&self) -> u64 {
        self.id
    }
}
