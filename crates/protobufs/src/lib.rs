#[macro_use]
extern crate bitflags;

#[path = "protos/teg_protobufs.rs"]
mod teg_protobufs;

pub use teg_protobufs::*;

pub use prost::Message;

bitflags! {
    pub struct MachineFlags: u64 {
        /// Toggles Motors enabled and disabled.
        const MOTORS_ENABLED = 0b0000_0000_0000_0001;
        /// Toggles between Relative and Absolute positioning
        const ABSOLUTE_POSITIONING = 0b0000_0000_0000_0010;
        /// Toggles between Metric (millimeters) and Imperial (inches)
        const MILLIMETERS = 0b0000_0000_0000_0100;
    }
}

impl Default for MachineFlags {
    fn default() -> MachineFlags {
        MachineFlags::ABSOLUTE_POSITIONING | MachineFlags::MILLIMETERS
    }
}
