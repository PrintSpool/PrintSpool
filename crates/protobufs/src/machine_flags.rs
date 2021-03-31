bitflags! {
    pub struct MachineFlags: u64 {
        // More frequently set bits
        // -------------------------------------------------------------

        /// Toggles Motors enabled and disabled.
        const MOTORS_ENABLED = 0b0000_0000_0000_0001;
        /// Toggles between Relative and Absolute positioning
        const ABSOLUTE_POSITIONING = 0b0000_0000_0000_0010;
        /// Toggles between Metric (millimeters) and Imperial (inches)
        const MILLIMETERS = 0b0000_0000_0000_0100;

        // Less frequently set bits
        // -------------------------------------------------------------

        /// Marks the current state of the machine as the state in which a print was paused so that
        /// the print can resume from that same position later.
        const PAUSED_STATE = 0b1000_0000_0000_0000;
    }
}

impl Default for MachineFlags {
    fn default() -> MachineFlags {
        MachineFlags::ABSOLUTE_POSITIONING | MachineFlags::MILLIMETERS
    }
}
