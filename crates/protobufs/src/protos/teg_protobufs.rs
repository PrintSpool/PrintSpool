/// Combinators send ServerMessages
///
/// repeated uint32 ack_message_ids = 1;
/// uint32 message_id = 2;
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct ServerMessage {
    #[prost(oneof="server_message::Payload", tags="9, 10, 11, 15, 16, 17, 100, 110, 111")]
    pub payload: ::std::option::Option<server_message::Payload>,
}
pub mod server_message {
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct SetConfig {
        /// JSON encoded machine configuration
        #[prost(string, tag="1")]
        pub file_path: std::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct SpoolTask {
        #[prost(string, tag="1")]
        pub task_id: std::string::String,
        #[prost(string, tag="2")]
        pub client_id: std::string::String,
        /// Starting at a line number other then zero allows for prints to be resumed from a mid-print
        /// pause.
        #[prost(uint64, tag="8")]
        pub start_at_line_number: u64,
        /// Override tasks can be ran during jobs and do not set the
        /// despooled_line_number in the MachineMessage.
        ///
        /// They are executed silently to adjust machine settings such as feedrate
        /// override during another task.
        #[prost(bool, tag="9")]
        pub machine_override: bool,
        /// 4-7: task file is sent as either a file path or array of GCode commands
        #[prost(oneof="spool_task::Content", tags="4, 5")]
        pub content: ::std::option::Option<spool_task::Content>,
    }
    pub mod spool_task {
        /// 4-7: task file is sent as either a file path or array of GCode commands
        #[derive(Clone, PartialEq, ::prost::Oneof)]
        pub enum Content {
            #[prost(string, tag="4")]
            FilePath(std::string::String),
            #[prost(message, tag="5")]
            Inline(super::InlineContent),
        }
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct InlineContent {
        #[prost(string, repeated, tag="3")]
        pub commands: ::std::vec::Vec<std::string::String>,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct PauseTask {
        #[prost(string, tag="1")]
        pub task_id: std::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct DeviceDiscovered {
        #[prost(string, tag="1")]
        pub device_path: std::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct DeviceDisconnected {
        #[prost(string, tag="1")]
        pub device_path: std::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct EStop {
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Reset {
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct DeleteTaskHistory {
        #[prost(string, repeated, tag="1")]
        pub task_ids: ::std::vec::Vec<std::string::String>,
    }
    #[derive(Clone, PartialEq, ::prost::Oneof)]
    pub enum Payload {
        /// TODO: maybe the machine service should just listen to it's config file for changes?
        #[prost(message, tag="9")]
        SetConfig(SetConfig),
        #[prost(message, tag="10")]
        SpoolTask(SpoolTask),
        /// TODO: task pausing
        #[prost(message, tag="11")]
        PauseTask(PauseTask),
        /// immediately stop the machine
        #[prost(message, tag="15")]
        Estop(EStop),
        /// close and restart the machine service clearing any EStop in the process
        #[prost(message, tag="16")]
        Reset(Reset),
        /// reset the machine once the current task completes
        #[prost(message, tag="17")]
        ResetWhenIdle(Reset),
        /// TODO: delete task history at the end of a task
        #[prost(message, tag="100")]
        DeleteTaskHistory(DeleteTaskHistory),
        /// A notification that the relevant hardware (eg. an controller board or arduino) has been connected to hint
        /// that the machine service should try to connect if it is presently disconnected.
        #[prost(message, tag="110")]
        DeviceDiscovered(DeviceDiscovered),
        #[prost(message, tag="111")]
        DeviceDisconnected(DeviceDisconnected),
    }
}
/// Combinators send ServerMessages
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct InviteCode {
    #[prost(bytes, tag="1")]
    pub secret: std::vec::Vec<u8>,
    #[prost(bytes, tag="2")]
    pub host_public_key: std::vec::Vec<u8>,
}
/// Machines send MachineMessages
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct MachineMessage {
    /// 1-8: Payloads
    #[prost(oneof="machine_message::Payload", tags="1")]
    pub payload: ::std::option::Option<machine_message::Payload>,
}
pub mod machine_message {
    /// Note: Feedback is a seperate message from MachineMessage so it's indexing is namespaced and
    /// do not need to avoid collisions with payload indexes.
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Feedback {
        /// 1-5: Frequently set scalars
        #[prost(enumeration="Status", tag="1")]
        pub status: i32,
        /// variable length bitfield. Lower bits use less space.
        #[prost(uint64, tag="2")]
        pub machine_flags: u64,
        /// 6-15: Frequently set sub-messages
        /// Events may be duplicated and sent more then once.
        #[prost(message, repeated, tag="6")]
        pub task_progress: ::std::vec::Vec<TaskProgress>,
        #[prost(message, repeated, tag="7")]
        pub axes: ::std::vec::Vec<Axis>,
        #[prost(message, repeated, tag="8")]
        pub heaters: ::std::vec::Vec<Heater>,
        #[prost(message, repeated, tag="9")]
        pub speed_controllers: ::std::vec::Vec<SpeedController>,
        /// Raw response strings from the device. No guarentee is made that all
        /// responses received will be relayed to the combinator. A best effort
        /// attempt will be made to relay responses within a performance constraint.
        ///
        /// History entries will not be duplicated and will be sent at most once to each
        /// client.
        #[prost(message, repeated, tag="10")]
        pub gcode_history: ::std::vec::Vec<GCodeHistoryEntry>,
        // 16-99:  [Reserved for Future Use]

        /// Note: field numbers 16 through 2047 take 2 bytes
        /// 100-999 Less frequently set sub-messages
        #[prost(message, optional, tag="100")]
        pub error: ::std::option::Option<Error>,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Error {
        /// 2: reserved for future error codes implementation
        /// string code = 2;
        #[prost(string, tag="1")]
        pub message: std::string::String,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct TaskProgress {
        #[prost(string, tag="1")]
        pub task_id: std::string::String,
        #[prost(uint32, tag="2")]
        pub despooled_line_number: u32,
        #[prost(enumeration="TaskStatus", tag="3")]
        pub status: i32,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Axis {
        #[prost(string, tag="1")]
        pub address: std::string::String,
        /// Positions are in mm
        #[prost(float, tag="2")]
        pub target_position: f32,
        #[prost(float, tag="3")]
        pub actual_position: f32,
        #[prost(bool, tag="4")]
        pub homed: bool,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct Heater {
        #[prost(string, tag="1")]
        pub address: std::string::String,
        /// Temperatures are in celsius
        #[prost(float, tag="2")]
        pub target_temperature: f32,
        #[prost(float, tag="3")]
        pub actual_temperature: f32,
        #[prost(bool, tag="4")]
        pub enabled: bool,
        #[prost(bool, tag="5")]
        pub blocking: bool,
    }
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct SpeedController {
        #[prost(string, tag="1")]
        pub address: std::string::String,
        /// Speeds are is in RPM. > 0: clockwise, < 0: counterclockwise.
        #[prost(float, tag="2")]
        pub target_speed: f32,
        #[prost(float, tag="3")]
        pub actual_speed: f32,
        #[prost(bool, tag="4")]
        pub enabled: bool,
    }
    /// Raw response strings from the device correlated to the task + line number
    /// that preceeded them.
    #[derive(Clone, PartialEq, ::prost::Message)]
    pub struct GCodeHistoryEntry {
        #[prost(enumeration="GCodeHistoryDirection", tag="3")]
        pub direction: i32,
        #[prost(string, tag="4")]
        pub content: std::string::String,
    }
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum Status {
        Errored = 0,
        Estopped = 1,
        Disconnected = 2,
        Connecting = 3,
        Ready = 4,
    }
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum TaskStatus {
        /// Before sending to the driver
        /// SPOOLED;
        /// After sending to the driver
        TaskStarted = 0,
        TaskFinished = 1,
        TaskPaused = 2,
        TaskCancelled = 3,
        TaskErrored = 4,
    }
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum GCodeHistoryDirection {
        Rx = 0,
        Tx = 1,
    }
    /// 1-8: Payloads
    #[derive(Clone, PartialEq, ::prost::Oneof)]
    pub enum Payload {
        #[prost(message, tag="1")]
        Feedback(Feedback),
    }
}
